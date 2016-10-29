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

var mysql_conn={};
// INIT CALLBACKS!
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
    if(!config || config.db.type.toLowerCase()!=='mysql'){console.error('ONLY DEVELOPED FOR MYSQL');rootThread.do_exit();flagNegFunc();}
    if(!root_params.silent){console.log('rootThread DB SETTINGS: ',merge(true,{},config.db,{'user':vars.const_str.omitted,'pass':vars.const_str.omitted}));}
    mysql_conn = mysql.createConnection({
            //'debug':true,
            'database':config.db.db,
            'host': config.db.host,
            'user': config.db.user,
            'password': config.db.pass
        });
    mysql_conn.version=config.db.version;
    flagPosFunc();
});
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
    console.log("[rootThread] MYSQL CONNECTION ATTEMPT");
    var connect_result=mysql_conn.connect(function(err){
        if(err){
            if(!root_params.silent){console.log("[rootThread] MYSQL CONNECTION ERROR ",err);}
            return flagNegFunc.apply(null,utils.convert_args(arguments));
        }
        return flagPosFunc.apply(null,utils.convert_args(arguments));
    });
    return connect_result;
});


rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){


});




rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){
    if(!root_params.silent){
        console.log("\n\n\n================= do_terminate PID: "+process.pid+" =================","\n");}
    process.on('exit', function(code){
        if(!root_params.silent){
            console.log('===PROCESS process.on(\'exit\') EVENT===');
            console.log("\n================= \\\\do_terminate PID: "+process.pid+" =================","\n\n");
        }
    });
    flagPosFunc();
},{'priority':1});


rootThread.do_init();
