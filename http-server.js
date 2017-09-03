
//modules
var _ = require('underscore'),//http://underscorejs.org/
    merge = require('merge'),//allows deep merge of objects
    fs = require('fs'),
    url = require('url'),
    utils = require('bom-utils'),
    vars = require('bom-utils/vars');
//custom modules - for WIP
var genericHTTP = require('node-default-server')(),
	APIResponse = require('./jspkg/APIResponse')();
//varaibles
var doc_root='./',
    root_params={
        'silent':false,//actual settings
        'ports':'3000',
        'config':'./config',
        'found_params':[]
    };

// root_params.config=root_params.config;/// ?????
// var config=require('./jspkg/configurator')(process, fs, root_params);
// doc_root=root_params.doc_root;
root_params.ports=(root_params.ports.trim().length===0?'80,443,3000':root_params.ports).split(',');


fs.stat(doc_root, function(err, stats){
    if((!err || err===null) && stats.isDirectory()){
        if(doc_root.indexOf('./')===0){//express won't like this
            fs.realpath(doc_root, function(err, relPath){
                if(!err || err===null){
					start_http(relPath);
                }
            });
        }else{
			start_http(doc_root);
        }
    }else{
        console.log("COULD NOT START BAD DOCROOT",err.toString());
        process.exit();//not needed ^_^
    }
});

function start_http(docRoot){
    var gen_HTTP=new genericHTTP({'ports':root_params.ports,'doc_root':docRoot}),
		API=new APIResponse(),
		RouteCatchAll = require('./jspkg/routes')(gen_HTTP,API),
		RouteSample = require('./jspkg/routes/sample')(gen_HTTP,API),
		all_methods=['POST','GET','DELETE','PUT'];
    // /xxxxxx/$(T)
	new RouteSample({'methods':all_methods,'ports':root_params.ports}).bind(function(pkg, nextFunc){
		var call_schema={'value': false},
			uri_parts=pkg.uri.split(this.pattern);

		// theoretical async
	    if(find_res.length>0){
	        nextFunc(null,merge(true,{},API.response,{
	                'status':merge(true,{},API.response_success),
	                'payload':find_res.map(function(item){
	                    return merge(true,{},call_schema,{
	                        'value': item.value
	                    });
	                })
	            }
	        ));
	    }else{
	        nextFunc(null,merge(true,{},API.response,{'status':merge(true,{},API.response_success,{'error':"No Results"})}));
	    }
		// \\ theoretical async
	}, function(pkg){
        //for(var k in pkg){console.log("pkg."+k);}
		API.respond(pkg.res, pkg.route_result.result);
    });

	//simulate 400/404
	new RouteCatchAll({'methods':all_methods,'ports':root_params.ports}).bind();

}
