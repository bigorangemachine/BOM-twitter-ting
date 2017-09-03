
module.exports = function(genHTTP, API){
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    var self_init=function(opts){//private methods
            var self=this;
        };

    //statics
    var schema={
		'pattern':new RegExp('.*','gi'),
		'methods':[],
		'ports':[]
	};

    function Routes(opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        // var protected_obj={'private':'thing'},
        //     protected_getter=function(keyIn){return function(){return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);}},
        //     protected_setter=function(keyIn){return function(v){protected_obj[keyIn]=v;}},
        //     readonly_obj={'readonlyitem':'publickey'},
        //     readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
        // if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
        //     //protected
        //     this.__defineSetter__('private', protected_getter('private'));
        //     this.__defineGetter__('private', protected_setter('private'));
		//
        //     //readonly
        //     this.__defineGetter__('readonlyitem', readonly_getter('readonlyitem'));
        // }else{
        //     //protected
        //     Object.defineProperty(this, 'private', {'set': protected_setter('private'),'get': protected_getter('private')});
		//
        //     //readonly
        //     Object.defineProperty(this, 'readonlyitem', {'get': readonly_getter('readonlyitem')});
        // }

        //model setter!
        for(var s in schema){//set schema default
            /* istanbul ignore else */
            if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};

    //public methods
	Routes.prototype.bind=function(lookupAction, responseAction){
		var self=this,
			lookup_action=(typeof(lookupAction)==='function'?lookupAction.bind(self):function(pkg, nextFunc){
				nextFunc(null,merge(true,{},API.response,{'status':merge(true,{},API.response_failed)}));
			}),
			response_action=(typeof(responseAction)==='function'?responseAction.bind(self):function(pkg){
				API.fail(pkg.res, pkg.route_result.result);
			});

		genHTTP.add_route(self.pattern, self.methods, self.ports, lookup_action, response_action);
	};

	return Routes;
}
