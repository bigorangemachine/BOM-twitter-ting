//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    mysql = require('mysql'),//https://github.com/felixge/node-mysql/
    fs = require('fs'),
    http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    md5 = require('md5'),
    repeat = require('string.prototype.repeat'),//FOR EASY DEBUGGING :D
    JSON = require('JSON'),
    utils = require('bom-utils'),
    vars = require('bom-utils/vars');
//custom modules - for WIP
// var utils = require('./jspkg/utils'),
//     vars = require('./jspkg/vars');
//varaibles
var doc_root='',
    root_params={
        'silent':false,//actual settings
        'croncurrent':'',
        'logpath':'',
        'doremove':false,
        'whichnode':'node',
        'cronfile':'cron.job',
        'rootmodule':'',
        'config':'./config',
        'found_params':[]
    };
root_params.config=root_params.config+'.dev';
var config=require('./jspkg/configurator')(process, fs, root_params);
doc_root=root_params.doc_root;
root_params.logpath=(root_params.logpath.length>0?utils.check_strip_last(root_params.logpath,'/')+'/':doc_root+'_cache/');

var c0redP=require('Pourtals')(),
    rootThread=new c0redP(function(){
        process.exit();//nothing happens after this - except the event hadler
    });

//rootThread._SCOPE_.large_queue['start'].setPool

rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    var cron_interval=2,//thought it was 1
        num_max=6 * cron_interval,// run 'x' number of times
        mod_10sec=10;
console.log(' - ',new Date().getMinutes()+':'+new Date().getSeconds());
    for(var inc=0;inc<=(num_max-1);inc++){
console.log("inc: ",inc);
        (function(num){
            var delayamt=mod_10sec * (num) * 1000,
                action_func=function(){
                    //do_async(function(){
console.log(num, ' - DONE ',new Date().getMinutes()+':'+new Date().getSeconds());
                        if(num>=(num_max-1)){flagPosFunc();}
                    //}); // OKAY!?!?!?!
                };
console.log(num, ' - INIT delayamt ',delayamt,' - ',new Date().getMinutes()+':'+new Date().getSeconds());
            if(delayamt>0){setTimeout(action_func, delayamt);}
            else{action_func();}

        })(inc);
    }

});
//},{'priority':9000});


rootThread.do_init();
