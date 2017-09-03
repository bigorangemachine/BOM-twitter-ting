
module.exports = function(apiConfig){
	var HarvestModel=require('./harvest.model'),
		Twitter = require('twitter'),
		utils=require('bom-utils'),merge=require('merge'),_=require('underscore'),fs=require('fs'),querystring=require('querystring');
	var self_init=function(opts){//private methods
			var self=this;
		};

	//statics
	var schema={
		'consumer_key': apiConfig.api_key,
		'consumer_secret': apiConfig.secret,
		'access_token_key': apiConfig.access_token,
		'access_token_secret': apiConfig.access_secret
	};

	function TweetHarvest(opts){
		if(!opts){opts={};}

		var ident=opts.ident,
			doc_root=utils.check_strip_last(typeof opts.doc_root==='string' && opts.doc_root.length>0 && fs.existsSync(opts.doc_root)?opts.doc_root:process.cwd(),'/')+'/',
			cache_path=utils.check_strip_last(typeof opts.path==='string' && opts.path.length>0 && fs.existsSync(doc_root + opts.path)?opts.path:'/','/')+'/';
		if(!utils.basic_str(opts.ident)){throw new Error("[TweetHarvest] option 'ident' must be a non-empty string.");}
		if(utils.check_strip_last(doc_root,'/')!==utils.check_strip_last(opts.doc_root,'/')){
			console.warn("[TweetHarvest] Property 'doc_root' was not resolved.  Assuming 'doc_root' of '" + doc_root + "'.");}
		if(utils.check_strip_last(cache_path,'/')!==utils.check_strip_last(opts.path,'/')){
			console.warn("[TweetHarvest] Property 'path' was not resolved.  Assuming 'path' of '" + cache_path + "'.");}

		//private variables - need to be objects
		var protected_obj={
				'twitter_client':{},
				'harvest_data':this.model(merge(true, opts, {
					'log_file':ident + '_info.json'
				}))
			},
			protected_getter=function(keyIn){return function(){
				/* istanbul ignore next */
				return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);
			}},
			protected_setter=function(keyIn){
				return function(v){
					if(keyIn==='harvest_data' && !(v instanceof HarvestModel)){
						throw new TypeError("[TweetHarvest] Property 'harvest_data' must be an instance of 'HarvestModel'.");
					}else if(keyIn==='twitter_client' && !(v instanceof Twitter)){
						throw new TypeError("[TweetHarvest] Property 'twitter_client' must be an instance of 'Twitter'.");
					}
					protected_obj[keyIn]=v;
			}},
			readonly_obj={
				'ident':ident,
				'thread':utils.basic_str(opts.thread)?opts.thread:ident + (new Date()).getTime(), // process.pid
				'doc_root':doc_root,
				'path':cache_path
			},
			readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
		/* istanbul ignore next */
		if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
			//protected
			this.__defineSetter__('harvest_data', protected_getter('harvest_data'));
			this.__defineGetter__('harvest_data', protected_setter('harvest_data'));
			this.__defineSetter__('twitter_client', protected_getter('twitter_client'));
			this.__defineGetter__('twitter_client', protected_setter('twitter_client'));

			//readonly
			this.__defineGetter__('ident', readonly_getter('ident'));
			this.__defineGetter__('thread', readonly_getter('thread'));
			this.__defineGetter__('doc_root', readonly_getter('doc_root'));
			this.__defineGetter__('path', readonly_getter('path'));
		}else{
			//protected
			Object.defineProperty(this, 'harvest_data', {'set': protected_setter('harvest_data'),'get': protected_getter('harvest_data')});
			Object.defineProperty(this, 'twitter_client', {'set': protected_setter('twitter_client'),'get': protected_getter('twitter_client')});

			//readonly
			Object.defineProperty(this, 'ident', {'get': readonly_getter('ident')});
			Object.defineProperty(this, 'thread', {'get': readonly_getter('thread')});
			Object.defineProperty(this, 'doc_root', {'get': readonly_getter('doc_root')});
			Object.defineProperty(this, 'path', {'get': readonly_getter('path')});
		}

		//model setter!
		for(var s in schema){//set schema default
			/* istanbul ignore else */
			if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};

	//public methods
	TweetHarvest.prototype.start=function(exitCallback){
		var self=this,
			full_path=self.fullpath();
		safeOpen(function(dataObj){
			var model_data={
					'log_file':self.harvest_data.log_file,
					'expire':self.harvest_data.expire
				};
			if(dataObj){
				model_data=merge(true, model_data, {
					'modified_stamp':dataObj.modified_stamp,
					'next_results':dataObj.next_results,
					'max_id':dataObj.max_id,
					'since_id':dataObj.since_id,
					'query':dataObj.query,
					'count':dataObj.count
				});
				tmp_model=self.model(model_data);
				if(!self.is_owned_cycle(tmp_model, dataObj)){
					return exitCallback(new Error("[TweetHarvest] Harvest is currently locked."), {'results':dataObj});
				}
			}else{
				model_data=merge(true, model_data, {
					'next_results':self.harvest_data.next_results,
					'max_id':self.harvest_data.max_id,
					'since_id':self.harvest_data.since_id,
					'query':self.harvest_data.query,
					'count':self.harvest_data.count
				});
			}

			self.harvest_data=self.model(model_data);
			self.save(function(err, obj){//save will throw its own error
				exitCallback(err, {'results':obj});//call clean (no throw)
			});
		});
		function safeOpen(afterOpenCallback){
			if(fs.existsSync(full_path)){
				return fs.stat(full_path, function(err, statsObj){
					throw_and_call(err, {'stat':statsObj}, exitCallback);
					if(statsObj.isFile()){
						fs.readFile(full_path, function(err, jsonData){
							throw_and_call(err, {'json':jsonData}, exitCallback);
							afterOpenCallback(JSON.parse(jsonData));
						});
					}else{
						afterOpenCallback(false);
					}
				});
			}
			afterOpenCallback(false);
		}
	};
	TweetHarvest.prototype.fullpath=function(){
		return this.doc_root + this.path + this.harvest_data.log_file;
	};
	TweetHarvest.prototype.consume=function(exitCallback){
		var self=this,
			twitter_opts={
				'consumer_key': self.consumer_key,
				'consumer_secret': self.consumer_secret,
				'access_token_key': self.access_token_key,
				'access_token_secret': self.access_token_secret,
			};
		try{
			self.twitter_client=new Twitter(twitter_opts);
		}catch(twitterErr){
			throw_and_call(twitterErr, {'twitter':twitter_opts}, exitCallback);
		}
		self.twitter_client.get('search/tweets.json', self.query(), function(err, body, res){
			exitCallback(null,{'body':body, 'res':res});
		});
	};
	TweetHarvest.prototype.save=function(exitCallback){
		var self=this,
			file_data=merge(true, {
				'ident':self.ident,
				'thread':self.thread
			}, JSON.parse(JSON.stringify(self.harvest_data)));
		fs.writeFile(self.fullpath(), JSON.stringify(file_data), function(err){
			throw_and_call(err, file_data, exitCallback);
			exitCallback(err, file_data);
		});
	};
	TweetHarvest.prototype.model=function(opts){
		return new HarvestModel(opts);
	};
	TweetHarvest.prototype.query=function(){
		return querystring.parse(utils.check_strip_first(utils.basic_str(this.harvest_data.next_results)?this.harvest_data.next_results:this.harvest_data.query, '?'));
	};
	TweetHarvest.prototype.is_owned_cycle=function(useModel, dataObj){
		var self=this,
			context_data=typeof(dataObj)==='object'?dataObj:{'ident':self.ident},
			context_model=useModel instanceof HarvestModel?useModel:self.harvest_data;
		return context_model.has_expired() || (!context_model.has_expired() && context_data.ident!==self.ident)?false:true;
	};

	return TweetHarvest;
}

//throw_and_call() only meant to check if an error and throw. Otherwise directly exit
function throw_and_call(err, obj, callback){if(err){callback(err, obj);throw err;}}
