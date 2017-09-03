

var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
//statics
var schema={'modified_stamp':new Date()};

function HarvestModel(opts){
	if(!opts){opts={};}

	//private variables - need to be objects
	var protected_obj={
			'next_results':utils.basic_str(opts.next_results)?opts.next_results:'',
			'max_id':utils.basic_str(opts.max_id)?opts.max_id:'',
			'since_id':utils.basic_str(opts.since_id)?opts.since_id:'',
			'query':utils.basic_str(opts.query)?opts.query:''
		},
		protected_getter=function(keyIn){return function(){
			/* istanbul ignore next */
			return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);
		}},
		protected_setter=function(keyIn){
			/* istanbul ignore next */
			return function(v){
				this.modified_stamp=new Date();
				//if(['max_id', 'since_id'].includes(keyIn)){refresh_query(v);}
				protected_obj[keyIn]=v;
			};
			// function refresh_query(v){
			// 	//parse the string into an object "foo"
			// 	//if foo[keyIn]
			// 		//protected_obj.query=foo[keyIn];
			// }
		},
		readonly_obj={
			'count':(typeof(opts.count)==='number' && opts.count>0?opts.count:100),
			'log_file':utils.check_strip_last((typeof opts.log_file ==='string' && opts.log_file.length>0?opts.log_file:'harvest'),'.json') + '.json',
			'expire':(typeof(opts.expire)==='number' && opts.expire>0?opts.expire:1),//in mins
			'unique_id':new Date().getTime().toString() + '-' + utils.getRandomInt(111111, 999999)
		},
		readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
	/* istanbul ignore next */
	if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
		//protected
		this.__defineSetter__('next_results', protected_getter('next_results'));
		this.__defineGetter__('next_results', protected_setter('next_results'));

		this.__defineSetter__('max_id', protected_getter('max_id'));
		this.__defineGetter__('max_id', protected_setter('max_id'));

		this.__defineSetter__('since_id', protected_getter('since_id'));
		this.__defineGetter__('since_id', protected_setter('since_id'));

		this.__defineSetter__('query', protected_getter('query'));
		this.__defineGetter__('query', protected_setter('query'));

		//readonly
		this.__defineGetter__('count', readonly_getter('count'));
		this.__defineGetter__('log_file', readonly_getter('log_file'));
		this.__defineGetter__('expire', readonly_getter('expire'));
		this.__defineGetter__('unique_id', readonly_getter('unique_id'));
	}else{
		//protected
		Object.defineProperty(this, 'next_results', {'set': protected_setter('next_results'),'get': protected_getter('next_results')});
		Object.defineProperty(this, 'max_id', {'set': protected_setter('max_id'),'get': protected_getter('max_id')});
		Object.defineProperty(this, 'since_id', {'set': protected_setter('since_id'),'get': protected_getter('since_id')});
		Object.defineProperty(this, 'query', {'set': protected_setter('query'),'get': protected_getter('query')});

		//readonly
		Object.defineProperty(this, 'count', {'get': readonly_getter('count')});
		Object.defineProperty(this, 'log_file', {'get': readonly_getter('log_file')});
		Object.defineProperty(this, 'expire', {'get': readonly_getter('expire')});
		Object.defineProperty(this, 'unique_id', {'get': readonly_getter('unique_id')});
	}

	//model setter! - NO SCHEMA USAGE IN THIS MODEL except modified_stamp which needs its own thing
	// for(var s in schema){//set schema default
	// 	/* istanbul ignore else */
	// 	if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

	this.modified_stamp=utils.basic_str(opts.modified_stamp)?new Date(opts.modified_stamp):new Date();

	(function(schema, protected_obj, readonly_obj){
		//public methods with private scope
		HarvestModel.prototype.toJSON=function(){
	        var self=this,keylist=Object.keys(schema).concat(Object.keys(protected_obj),Object.keys(readonly_obj)),output={};
			for(var i=0;i<keylist.length;i++){
				var key=keylist[i];
				if(['log_file'].includes(key)){continue;}
				output[key]=self[key];
			}
	        return output;
		};
	}).apply(this,[schema,protected_obj,readonly_obj]);
};
//public methods
HarvestModel.prototype.has_expired=function(){
	return (this.modified_stamp.getTime() + this.expire*60*1000) < (new Date()).getTime();
};
module.exports = HarvestModel;
