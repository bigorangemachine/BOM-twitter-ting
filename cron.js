
//modules
var _ = require('underscore'),//http://underscorejs.org/
	merge = require('merge'),//allows deep merge of objects
	mysql = require('mysql'),//https://github.com/felixge/node-mysql/
	http = require('http'),
	url = require('url'),
	querystring = require('querystring'),
	md5 = require('md5'),
	path = require('path'),
	JSON = require('JSON'),
	Twitter = require('twitter'),
	utils = require('bom-utils'),
	vars = require('bom-utils/vars');
//custom modules - for WIP
// var utils = require('./jspkg/utils'),
//	 vars = require('./jspkg/vars');
//varaibles
var doc_root='',
	root_params={
		'silent':false,//actual settings
		'rootmodule':'',
		'config':'./config',
		'found_params':[]
	};
var config=require('./jspkg/configurator')(root_params);
doc_root=root_params.doc_root;

var c0redP=require('Pourtals')(),
	rootThread=new c0redP(function(){
		process.exit();//nothing happens after this - except the event hadler
	}),
	ExitManager=require('./jspkg/exitManager')(root_params),
	exit_manager=new ExitManager(rootThread.do_exit.bind(rootThread));

var mysql_conn={},
	twitter_client={};
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
rootThread.on('init',function(pkg,flagPosFunc,flagNegFunc){
	try{
		twitter_client = new Twitter({
			'consumer_key': config.API.api_key,
			'consumer_secret': config.API.secret,
			'access_token_key': config.API.access_token,
			'access_token_secret': config.API.access_secret,
		});
		flagPosFunc();
	}catch(err){
		flagNegFunc(err);
	}
});
// \\ INIT CALLBACKS!



var setup_id=rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
	var CriteraDB=require(path.join(process.cwd(),'./jspkg/db_modules/critera'))(mysql_conn),
		Wheatley=require('Pourtals/sub/c0re/Wheatley')(),
		critera_db=new CriteraDB();
	critera_db.get({
		'done':function(query, queryInfo){
// console.log("DONE!: ",queryInfo.info.context);
			if(queryInfo.status==='success'){//success means rows!
				//unique id - stamp
				//start()
					//read/create data file
					//check busy
						//set marker (id/date)
					//if owned thread
						//start the harvest
							//stop if zero records and not error
				flagPosFunc(queryInfo.info.context);
			}else{//fail means error objects
				flagNegFunc();
				throw queryInfo.info.context[0];//first error only
			}
			// xxxx.forEach(function(){
			// 	var worker=new Wheatley();
			// });

		}
	})();
});

rootThread.on('start',function(pkg,flagPosFunc,flagNegFunc){
	// this.find_id(setup_id);
	var records=this.queue.concat(this.temp_queue).filter(function(item){
			return item.unique_id===setup_id;
		})[0].result_args;
console.log("records",records,"\nsetup_id ",setup_id);
	flagPosFunc();
});


// EXIT CALLBACKS!
rootThread.on('exit',function(pkg,flagPosFunc,flagNegFunc){// first to end due to high priority number
	mysql_conn.end(function(err){//The connection is terminated now
		if(err){
			if(!root_params.silent){console.log('===mysql_conn.end===',arguments);}
			flagNegFunc();
		}else{
			flagPosFunc();
		}
	});

},{'priority':9000});

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
// \\ EXIT CALLBACKS!



rootThread.do_init();
