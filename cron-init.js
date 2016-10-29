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
//console.log(root_params);process.exit();
var c0redP=require('Pourtals')(),
    rootThread=new c0redP(function(){
        process.exit();//nothing happens after this - except the event hadler
    });


rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
    var ln="\n",
        write_str="MAILTO=\"\""+ ln +
            "*/2 * * * * "+root_params.whichnode+" "+doc_root+"cron.js >> "+root_params.logpath+"task.log 2>&1"+ ln +
            "@reboot sleep 30 && "+root_params.whichnode+" "+doc_root+"server.js >> "+root_params.logpath+"startup_apiserver.log 2>&1 &"+ ln +
            "* */1 * * * "+root_params.whichnode+" "+doc_root+"server.js >> "+root_params.logpath+"preserve_apiserver.log 2>&1 &"+ ln;
console.log("root_params.croncurrent: ",root_params.croncurrent);
    fs.writeFile(doc_root+root_params.cronfile, write_str, function(err) {
        if(err){flagNegFunc();return console.log(err);}
        flagPosFunc();
    });
});
//},{'priority':9000});


rootThread.do_init();
