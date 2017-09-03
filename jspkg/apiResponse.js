
module.exports = function(){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),vars=require('bom-utils/vars'),merge=require('merge'),_=require('underscore'),JSON=require('JSON');
    //var parentAPIResponse=require('parentAPIResponse')(); <- expected
    var self_init=function(opts){//private methods
            var self=this;
        };

    //statics
    var response_types={
			'json':{'response':JSON.stringify, 'headers':[{'Content-Type':vars.content_types.json}]},
			'xml':{'response':require('xml'), 'headers':[{'Content-Type':vars.content_types.xml}]}
		},
		response_success_schema={'code':200,'success':true,'error':null},
		response_failed_schema={'code':400,'success':false,'error':"Request is not found."},
		response_schema={'payload':{},'status':merge(true,{},response_failed_schema)},
		schema={
			'response_success':response_success_schema,
			'response_failed':response_failed_schema,
			'response':response_schema
		};

    function APIResponse(opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        var protected_obj={'response_types':response_types},
            protected_getter=function(keyIn){return function(){
				/* istanbul ignore next */
				return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);
			}},
            protected_setter=function(keyIn){
				/* istanbul ignore next */
				return function(v){protected_obj[keyIn]=v;
			}},
            readonly_obj={
            	'output_type':typeof opts.output_type === 'string' && Object.keys(response_types).indexOf(opts.output_type)!==-1?opts.output_type:'json'
            },
            readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
        /* istanbul ignore next */
        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            //protected
            this.__defineSetter__('response_types', protected_getter('response_types'));
            this.__defineGetter__('response_types', protected_setter('response_types'));

            //readonly
            this.__defineGetter__('output_type', readonly_getter('output_type'));
        }else{
            //protected
            Object.defineProperty(this, 'response_types', {'set': protected_setter('response_types'),'get': protected_getter('response_types')});

            //readonly
            Object.defineProperty(this, 'output_type', {'get': readonly_getter('output_type')});
        }

        //model setter!
        for(var s in schema){//set schema default
            /* istanbul ignore else */
            if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};
    //public methods
    APIResponse.prototype.respond=function(res,jsonOutput,extraHeaders){
        var self=this,
        	extra_headers=(extraHeaders instanceof Array?extraHeaders:[]);
        response_types[self.output_type].headers.concat(extra_headers).forEach(function(header){
        	for(var type in header){
        		res.setHeader(type, header[type]);
        	}
        });

        res.send(response_types[self.output_type].response(jsonOutput));
    };
    APIResponse.prototype.fail=function(res,jsonOutput,extraHeaders){
        var self=this;
        res.status(404);
        self.respond(res,jsonOutput,extraHeaders);
    };

    return APIResponse;
}
