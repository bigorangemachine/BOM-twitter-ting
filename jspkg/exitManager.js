//very quickly written!
module.exports = function(root_params){//dependancies
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),vars=require('bom-utils/vars');
    function ExitManager(exitCallback,opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        var exit_manager={
                'init':function(){
                    if(_.indexOf(exit_manager.shutdown_status_whitelist, exit_manager.shutdown_status)!==-1){exit_manager.shutdown_status='uninit';}
                    if(exit_manager.shutdown_status==='uninit'){
                        // process handlers
                        //process.stdin.resume();//so the program will not close instantly
                        process.on('uncaughtException', function(err){
                            var doEmojis=false,doStopOnErr=true,silentErrors=false,emojiErrStr=vars.emonji.skull+' ',
                                emojiWarnStr=vars.emonji.siren+' ',stackLines=err.stack.split("\n");
                            silentErrors=true;//personal preference :D
                            doEmojis=true;//vars.emonji.caution
                            stackLines=stackLines.slice(1,stackLines.length);
                            stackLines.forEach(function(v,i,arr){
                                var this_trace=arr[i],
                                    at_regexp=new RegExp("^[\\t\\s]+at[\\t\\s]+",'gi'),
                                    splitted='';
                                if(this_trace.match(at_regexp)!==null){
                                    splitted=this_trace.replace(at_regexp,'').trim().split(' ');
                                    if(splitted.length>1){
                                        var split_file=utils.check_strip_last(utils.check_strip_first(splitted[splitted.length-1],'('),')');
                                        var file_line_col=split_file.split(':');
                                        arr[i]={'full':arr[i],'linenum':file_line_col[1],'column':file_line_col[2],'funcstack':splitted[0],'filepath':file_line_col[0]};
                                    }else{
                                        arr[i]={'full':arr[i],'linenum':'','column':'','funcstack':'','filepath':''};
                                    }
                                }
                            });

                            if(doEmojis){
                                var longest_line=0,
                                    longest_str='',
                                    built_lines=[],
                                    clean_ansi=function(dirtyStr){
                                        var output=dirtyStr;
                                        for(var k in vars.console_chrs){
                                            if(utils.obj_valid_key(vars.console_chrs,k)){
                                                output=output.replace(new RegExp(utils.regexp_escape(vars.console_chrs[k]),'gi'),'');
                                            }
                                        }
                                        return output;
                                    },
                                    build_str=function(strIn, rowStr){
                                        var flare_str=emojiWarnStr.repeat(3).trim(),
                                            prefix_str=flare_str.trim() +  " ".repeat(4),
                                            suffix_base=flare_str.trim(),
                                            suffix_pad=rowStr.length - prefix_str.length - clean_ansi(strIn).length - suffix_base.length,
                                            suffix_str=(" ".repeat((suffix_pad>0?suffix_pad:1))) + suffix_base.trim();//.replace('  ',"	")
                                        if(longest_line<rowStr.trim().length){longest_line=rowStr.trim().length;longest_str=rowStr.trim();}
                                        var output=prefix_str + strIn + suffix_str,
                                            cleaned_output=cleaned_output=clean_ansi(output);
                                        if(longest_line<cleaned_output.trim().length){longest_line=cleaned_output.trim().length;longest_str=cleaned_output.trim();}

                                        built_lines.push({'cleaned':cleaned_output,'output':output,'input':strIn,'row_len':rowStr.length});
                                        return output;

                                    };
                                var inc=0,inc_max=10,targetWidth=Math.ceil(process.stdout.columns/emojiErrStr.length/2);// added / emojiErrStr.length because if len is 1 nothing changes... if len is say 5... then you need to adjust
                                do{
                                    built_lines=[];
                                    var rowStr=emojiErrStr.repeat( (longest_line===0?targetWidth:longest_line/emojiErrStr.length) );
//console.log('rowStr',rowStr,' repeat num ',(longest_line===0?targetWidth:longest_line));
                                    build_str(err.toString(), rowStr);
                                    if(typeof(err.fileName)!=='undefined' || typeof(err.lineNumber)!=='undefined' || typeof(err.columnNumber)!=='undefined'){
                                        build_str(err.fileName + ' - Line: '+err.lineNumber+'('+err.columnNumber+')', rowStr);
                                    }else{
                                        for(var s=0;s<stackLines.length;s++){
                                            if(stackLines[s].filepath.indexOf(root_params.doc_root)!==-1){
                                                build_str(vars.console_chrs.yellow+utils.check_strip_first(stackLines[s].filepath, root_params.doc_root) + vars.console_chrs.clearall + ' - ' +
                                                    vars.console_chrs.bold + 'Line: ' + vars.console_chrs.clearall +
                                                    vars.console_chrs.red + stackLines[s].linenum + vars.console_chrs.clearall +
                                                    ' ('+stackLines[s].column+
                                                ')', rowStr);
                                            }
                                        }
                                    }
                                    inc++;
                                    if(inc>=inc_max){break;}
//console.log(longest_line,' !== ',rowStr.length, ' longest_str ',longest_str, ' longest_str.length ',longest_str.length);//, ' longest_str ',longest_str
                                }while(longest_line!==rowStr.length);//continue while true

                                console.log();
                                console.log(rowStr);
                                for(var l=0;l<built_lines.length;l++){
                                    console.log(built_lines[l].output);
                                }
                                console.log(rowStr);
                                console.log();
                            }

                            if(doStopOnErr && !silentErrors){throw err;}//throwing here causes a halt
                            else{console.log("[ExitManager uncaughtException] ",err.toString(),"\n"+("*").repeat(Math.ceil(process.stdout.columns/4))+" STACK TRACE "+("*").repeat(Math.ceil(process.stdout.columns/4))+"\n",err.stack);}

                            var shutdown_result=true;
                            try{
                                if(doStopOnErr){exit_manager.start_exit();}
                            }catch(tryCatchErr){//redundant but very sure!
                                shutdown_result=false;
                                console.log("\n[ExitManager] exit_manager process.exit() ERROR!\n"+tryCatchErr.toString()+"\n");
                                throw tryCatchErr;
                            }finally{
                                if(shutdown_result===false){
                                    try{
                                        process.exit();
                                    }catch(FinalErr){//redundant but very sure!
                                        throw FinalErr;
                                        process.exit();
                                    }
                                }
                            }
                        });
                        process.on('SIGINT', function(){
                            if(exit_manager.SIGINT_inc===0){//manage the CLI so CTRL+C bashing won't give in right-away
                                console.log("");//create a new line
                                console.log("[ExitManager] SIGINT recieved\n");
                                exit_manager.start_exit();
                                exit_manager.SIGINT_inc++;
                                exit_manager.date_stamp=new Date();
                            }else{//the buffer!
                                var timefail=(((new Date()) - exit_manager.date_stamp)>(exit_manager.SIGINT_timeout)?true:false),
                                    sigintfail=(exit_manager.SIGINT_inc-1>=exit_manager.SIGINT_max?true:false);
                                if(sigintfail || timefail){
                                    console.log("[ExitManager] SIGINT EXCEEDED "+
                                        (sigintfail?(exit_manager.SIGINT_inc-1)+" of "+exit_manager.SIGINT_max:'')+
                                        (timefail?'SIGNINT delay time exceeded '+(exit_manager.SIGINT_timeout/1000).toFixed(1)+' seconds':'')+
                                    "! Attempting abort & exit!");
                                    if(exit_manager.shutdown_status=='forced'){process.abort();}
                                    exit_manager.SIGINT_inc=0;
                                    exit_manager.start_exit();
                                }else{
                                    console.log("\n[ExitManager] Please be patient.  This is a soft forced shut down.  This is try "+(exit_manager.SIGINT_inc-1)+" of "+exit_manager.SIGINT_max+" dud-(re)tries or wait for "+(( new Date(exit_manager.date_stamp.getTime() + exit_manager.SIGINT_timeout).getTime()  - new Date().getTime() )/1000).toFixed(2)+" seconds\n");
                                    exit_manager.SIGINT_inc++;
                                }
                            }
                        });
                        process.on('exit', function(){
                            //console.log('exit ah yesh global!',exit_manager.shutdown_status);
                            if(exit_manager.shutdown_status==='forced' || exit_manager.shutdown_status==='done'){
                                process.exit();
                            }else{//this doesn't work if process dot exit () is called... it just ignores any deeper function calls (async)
                                //process.stdin.resume();//i dont' think this does what it should
                                exit_manager.start_exit();
                            }
                        });
                        // \\ process handlers
                        exit_manager.shutdown_status='active';
                        exit_manager.date_stamp=new Date();
                    }
                },
                'start_exit':function(){
                    //console.log("--------------- start_exit ---------------");
                    exit_manager.SIGINT_inc=0;
                    exit_manager.date_stamp=new Date();
//console.log('exit_manager.shutdown_status',exit_manager.shutdown_status);
                    if(exit_manager.shutdown_status==='quitting'){
                        exit_manager.date_stamp=new Date();
                        exit_manager.shutdown_status='forced';
                        process.exit();
                        process.nextTick(process.abort.bind(process));//FORCING! REFORCING!
                    }else{
//console.log('EXIT_CALLBACK() in do_exit callback!!!',exitCallback);
                        exit_manager.shutdown_status='quitting';
                        if(typeof(exitCallback)==='function'){exitCallback(exit_manager.exit);}
                        else{exit_manager.exit();}


                    }
                },
                'exit':function(){
                    //console.log("--------------- exit ---------------");
                    exit_manager.date_stamp=new Date();
                    exit_manager.shutdown_status='done';
                    process.exit();//true exit!
                },
                'SIGINT_inc':0,
                'SIGINT_max':5, //5 max tries
                'SIGINT_timeout':10000, //in milliseconds - 10 seconds
                'date_stamp':new Date(),
                'status_whitelist':['uninit','active','quitting','done','forced'],
                'shutdown_status': 'uninit'
            };


        exit_manager.init();
	};

    return ExitManager;
}
