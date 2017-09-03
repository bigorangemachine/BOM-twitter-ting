var path=require('path'),
	merge=require('merge'),
	sinon=require('sinon'),
	assert=require('chai').assert,
	fs=require('fs'),
	utils=require('bom-utils'),
	Twitter=require('twitter'),
	request=require('request'),// dpeendancy in twitter that I am using to throw an error because I can't override the constructor
	config=require(path.join(process.cwd(),'./tests/mocks/config.json')),
	freebandnames_query=require(path.join(process.cwd(),'./tests/mocks/query.freebandnames.json')),
	freebandnames_tweets=require(path.join(process.cwd(),'./tests/mocks/tweets_body.freebandnames.json')),
	TweetHarvest=require(path.join(process.cwd(),'./jspkg/tweet_harvest'))(config.API),
	HarvestModel=require(path.join(process.cwd(),'./jspkg/tweet_harvest/harvest.model')),
	sinon_objs={},
	require_swap={},
	file_paths={
		'doc_root':'/',
		'path':'_cache/'
	};

require('./harvest.model');// tmp!

describe('Tweet Harvest',function(){
	beforeEach(function(){
		sinon_objs.fs_mock=sinon.mock(fs);
		sinon_objs.fs_mock.expects('existsSync').withArgs(file_paths.doc_root).once();
		sinon_objs.fs_mock.expects('existsSync').withArgs(file_paths.doc_root + file_paths.path).once();

		sinon_objs.tweet_query_stub=sinon.stub(TweetHarvest.prototype,'query').callsFake(function(){
			console.log(this);
		});

		sinon_objs.console_warn_mock=sinon.stub(console,'warn');//silence the console.warn()
	});
	it('Initalize',function(){
		var opts={
				'ident':'TEST',
				'thread':'TEST-THREAD-101010101',
				'consumer_key': 'TEST-' + config.API.api_key,
				'consumer_secret': 'TEST-' + config.API.secret,
				'access_token_key': 'TEST-' + config.API.access_token,
				'access_token_secret': 'TEST-' + config.API.access_secret,
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			};
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		var harvester=new TweetHarvest(opts);

		sinon.assert.callCount(sinon_objs.fs_mock, 2);
		assert.strictEqual(harvester.doc_root, utils.check_strip_last(file_paths.doc_root,'/')+'/', "Option 'doc_root' was not set correctly");
		assert.strictEqual(harvester.path, utils.check_strip_last(file_paths.path,'/')+'/', "Option 'path' was not set correctly");
		assert.strictEqual(harvester.consumer_key, 'TEST-' + config.API.api_key, "Option 'consumer_key' was not set correctly");
		assert.strictEqual(harvester.consumer_secret, 'TEST-' + config.API.secret, "Option 'consumer_secret' was not set correctly");
		assert.strictEqual(harvester.access_token_key, 'TEST-' + config.API.access_token, "Option 'access_token_key' was not set correctly");
		assert.strictEqual(harvester.access_token_secret, 'TEST-' + config.API.access_secret, "Option 'access_token_secret' was not set correctly");
		assert.strictEqual(harvester.thread, opts.thread, "Option 'thread' was not set correctly");
	});
	it('Initalize - Minimal Options',function(){
		sinon_objs.console_warn_mock.restore();
		sinon_objs.console_warn_mock=sinon.mock(console);
		sinon_objs.console_warn_mock.expects('warn').withExactArgs("[TweetHarvest] Property 'doc_root' was not resolved.  Assuming 'doc_root' of '" + utils.check_strip_last(process.cwd(),'/')+'/' + "'.").once();
		sinon_objs.console_warn_mock.expects('warn').withExactArgs("[TweetHarvest] Property 'path' was not resolved.  Assuming 'path' of '/'.").once();

		var harvester=new TweetHarvest({'ident':'TEST'});

		sinon_objs.console_warn_mock.verify();
		assert.strictEqual(harvester.doc_root, utils.check_strip_last(process.cwd(),'/')+'/', "Option 'doc_root' was not set correctly");
		assert.strictEqual(harvester.path, '/', "Option 'path' was not set correctly");
		assert.strictEqual(harvester.consumer_key, config.API.api_key, "Option 'consumer_key' was not set correctly");
		assert.strictEqual(harvester.consumer_secret, config.API.secret, "Option 'consumer_secret' was not set correctly");
		assert.strictEqual(harvester.access_token_key, config.API.access_token, "Option 'access_token_key' was not set correctly");
		assert.strictEqual(harvester.access_token_secret, config.API.access_secret, "Option 'access_token_secret' was not set correctly");
		assert.strictEqual(harvester.ident, 'TEST', "Option 'ident' was not set correctly");
	});
	it('Initalize - No Options',function(){
		assert.throws(function(){new TweetHarvest();}, "[TweetHarvest] option 'ident' must be a non-empty string.", "Option 'access_token_secret' was not set correctly");

	});
	it('Get Model',function(){
        assert.instanceOf(new TweetHarvest({'ident':'TEST'}).model({}), HarvestModel, "Model constructor is not of type 'HarvestModel'.");
	});
	it('Set Model should throw if model is not used',function(){
		var harvester=new TweetHarvest({'ident':'TEST'});
		assert.throws(function(){harvester.harvest_data={};}, "[TweetHarvest] Property 'harvest_data' must be an instance of 'HarvestModel'.", "Setting key 'harvest_data' should throw an error");
	});
	it('Start Async with existing file',function(done){
		var opts={
				'query':freebandnames_query.query,
				'ident':'TEST-IDENT',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			},
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name,
			sandbox=sinon.sandbox.create(),
			simulated_date=new Date('2017-08-25T20:00:21.497Z'),
			clock=sinon.useFakeTimers(simulated_date.getTime()),
			cached_data=merge(true, {}, freebandnames_query, {
				'modified_stamp':new Date(simulated_date.getTime() - (0.3 * 60 *1000)),
				'ident':opts.ident,
				'thread': opts.ident+simulated_date.getTime()
			});

		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(null, full_path);
		sinon_objs.fs_mock.withArgs(full_path).returns(true);//json cache file
		sinon_objs.stat_mock=sinon.stub(fs,'stat');
		sinon_objs.stat_mock.withArgs(full_path).yields(null, {'isFile':function(){return true;}});
		sinon_objs.read_file_mock=sinon.stub(fs,'readFile');
		sinon_objs.read_file_mock.withArgs(full_path).yields(null, JSON.stringify(cached_data));


		var harvester=new TweetHarvest(opts),
			original_id=harvester.harvest_data.unique_id;
		addInstanceStartStub(harvester, null, {
			'count': cached_data.count,
			'expire': 1,
			'ident': opts.ident,
			'max_id': cached_data.max_id,
			'modified_stamp': cached_data.modified_stamp.toJSON(),
			'next_results': cached_data.next_results,
			'query': cached_data.query,
			'since_id': cached_data.since_id,
			'thread': harvester.thread
		});
		harvester.start(function(err, info){
			assertTest(err, info);
		});
		function assertTest(err, info){
			sandbox.restore();
			clock.restore();
			assert.strictEqual(err, null, "Error should be null when successful.");
			assert.deepEqual(info.results, merge(true,{},cached_data,{
				'modified_stamp':cached_data.modified_stamp.toJSON(),//we're ignore this as its tested in the model tester
				'ident':opts.ident,
				'expire':1
			}), "Data retrieved is not the expected object.");
			for(var key in cached_data){
				if(['modified_stamp','ident','thread'].includes(key)){continue;}
				assert.strictEqual(harvester.harvest_data[key], cached_data[key], "Harvest Data (HarvestModel) key '"+key+"' was not updated.");
			}
			assert.strictEqual(harvester.harvest_data.count, cached_data.count, "Harvest Data (HarvestModel) key 'count' was not updated.");

			sinon.assert.callCount(sinon_objs.stat_mock, 1);
			sinon.assert.callCount(sinon_objs.read_file_mock, 1);
			sinon.assert.callCount(sinon_objs.instance_save, 1);
			done();
		}
	});
	it('Start Async without existing file',function(done){
		var opts={
				'query':freebandnames_query.query,
				'ident':'TEST-IDENT',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			},
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name,
			sandbox=sinon.sandbox.create(),
			simulated_date=new Date('2017-08-25T20:00:21.497Z'),
			clock=sinon.useFakeTimers(simulated_date.getTime());

		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(null, full_path);
		sinon_objs.fs_mock.withArgs(full_path).returns(false);//no json cache file

		var harvester=new TweetHarvest(opts);
		addInstanceStartStub(harvester, null, {
			'thread':harvester.thread,
			'modified_stamp':simulated_date.toJSON(),
			'count':100,
			'ident':opts.ident,
			'expire':1,
			'next_results': '',// these are the default values
			'max_id': '',
			'since_id': '',
			'query': ''
		});
		harvester.start(function(err, info){
			assertTest(err, info);
		});
		function assertTest(err, info){
			sandbox.restore();
			clock.restore();
			assert.strictEqual(err, null, "Error should be null when successful.");
			assert.deepEqual(info.results, {
				'thread':harvester.thread,
				'modified_stamp':simulated_date.toJSON(),
				'count':100,
				'ident':opts.ident,
				'expire':1,
				'next_results': '',// these are the default values
				'max_id': '',
				'since_id': '',
				'query': ''
			}, "Data retrieved is not the expected object.");

			sinon.assert.callCount(sinon_objs.fs_mock, 3);
			sinon.assert.callCount(sinon_objs.instance_save, 1);
			done();
		}
	});
	it('Start Async - Found path is not file',function(done){
		var opts={
				'query':freebandnames_query.query,
				'ident':'TEST-IDENT',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			},
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name,
			sandbox=sinon.sandbox.create(),
			simulated_date=new Date('2017-08-25T20:00:21.497Z'),
			clock=sinon.useFakeTimers(simulated_date.getTime());

		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		sinon_objs.fs_mock.withArgs(full_path).returns(true);//json cache file
		sinon_objs.stat_mock=sinon.stub(fs,'stat');
		sinon_objs.stat_mock.withArgs(full_path).yields(null, {'isFile':function(){return false;}});


		var harvester=new TweetHarvest(opts);
		addInstanceStartStub(harvester, null, {
			'thread':harvester.thread,
			'modified_stamp':simulated_date.toJSON(),
			'count':100,
			'ident':opts.ident,
			'expire':1,
			'next_results': '',// these are the default values
			'max_id': '',
			'since_id': '',
			'query': ''
		});
		harvester.start(function(err, info){
			assertTest(err, info);
		});

		function assertTest(err, info){
			sandbox.restore();
			clock.restore();
			assert.strictEqual(err, null, "Error should be null when successful.");
			assert.deepEqual(info.results, {
				'thread':harvester.thread,
				'modified_stamp':simulated_date.toJSON(),
				'count':100,
				'ident':opts.ident,
				'expire':1,
				'next_results': '',// these are the default values
				'max_id': '',
				'since_id': '',
				'query': ''
			}, "Data retrieved is not the expected object.");
			done();
		}
	});
	it('Start Async - Fail to find file',function(done){
		var err_str="Something went wrong",
			opts={
				'query':freebandnames_query.query,
				'ident':'TEST-IDENT',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			},
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;

		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(null, full_path);
		sinon_objs.fs_mock.withArgs(full_path).returns(true);//json cache file
		sinon_objs.stat_mock=sinon.stub(fs,'stat');
		sinon_objs.stat_mock.withArgs(full_path).yields(new Error(err_str), null);


		var harvester=new TweetHarvest(opts);
		assert.throws(function(){
			harvester.start(function(err, info){
				assertTest(err, info);
			});
		}, err_str);

		function assertTest(err, info){
			setTimeout(function(){//pop out of the 'assert.throws' so these thrown assertions report correctly
				sinon.assert.callCount(sinon_objs.stat_mock, 1);
				assert.instanceOf(err, Error, "Error was not passed into the callback.");
				assert.strictEqual(info.stat, null, "Info was not passed into the callback.");
				done();
			}, 0);
		}
	});
	it('Start Async - Fail to unlock',function(done){
		var err_str="[TweetHarvest] Harvest is currently locked.",
			opts={
				'query':freebandnames_query.query,
				'ident':'TEST-IDENT',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			},
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name,
			cached_data=merge(true, {}, freebandnames_query, {
				'ident':opts.ident,
				'thread': opts.ident+'993938287272'
			});

		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(null, full_path);
		sinon_objs.fs_mock.withArgs(full_path).returns(true);//json cache file
		sinon_objs.stat_mock=sinon.stub(fs,'stat');
		sinon_objs.stat_mock.withArgs(full_path).yields(null, {'isFile':function(){return true;}});
		sinon_objs.read_file_mock=sinon.stub(fs,'readFile');
		sinon_objs.read_file_mock.withArgs(full_path).yields(null, JSON.stringify(cached_data));


		var harvester=new TweetHarvest(opts);
		addInstanceStartStub(harvester, null, {}, false);
		harvester.start(function(err, info){
			assertTest(err, info);
		});

		function assertTest(err, info){
			sinon.assert.callCount(sinon_objs.instance_is_owned, 1);
			assert.instanceOf(err, Error, "Error was not passed into the callback.");
			assert.strictEqual(err.message, err_str, "Error recieved was not the expected message.");
			assert.deepEqual(info.results, cached_data, "Info was not passed into the callback.");
			done();
		}
	});
	it('Save',function(done){
		var opts=merge(true, freebandnames_query, {
				'ident':'TEST',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			}),
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(null, full_path);
		var harvester=new TweetHarvest(opts);

		harvester.save(function(err, info){
			sinon.assert.callCount(sinon_objs.writefile_mock, 1);
			assert.strictEqual(err, null, "Error recieved was not the expected null.");
			assert.deepEqual(info, merge(true, freebandnames_query, {
				'expire':harvester.harvest_data.expire,
				'unique_id':harvester.harvest_data.unique_id,
				'modified_stamp':harvester.harvest_data.modified_stamp.toJSON(),
				'ident':harvester.ident,
				'thread':harvester.thread
			}), "Info was not passed into the callback.");
			done();
		});
	});
	it('Save - Thrown Error',function(done){
		var err_str="Something went wrong.",
			opts=merge(true, freebandnames_query, {
				'ident':'TEST',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			}),
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);
		addWriteFileStub(new Error(err_str), full_path);
		var harvester=new TweetHarvest(opts);

		assert.throws(function(){
			harvester.save(function(err, info){
				setTimeout(function(){//pop out of the 'assert.throws' so these thrown assertions report correctly
					sinon.assert.callCount(sinon_objs.writefile_mock, 1);
					assert.instanceOf(err, Error, "Error was not passed into the callback.");
					assert.deepEqual(info, merge(true, freebandnames_query, {
						'expire':harvester.harvest_data.expire,
						'unique_id':harvester.harvest_data.unique_id,
						'modified_stamp':harvester.harvest_data.modified_stamp.toJSON(),
						'ident':harvester.ident,
						'thread':harvester.thread
					}), "Info was not passed into the callback.");
					done();
				}, 0);
			});
		}, err_str);
	});
	it('Is Owned Cycle',function(){
		var opts=merge(true, freebandnames_query, {
				'ident':'TEST',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			}),
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);

		var harvester=new TweetHarvest(opts);
		assert.strictEqual(harvester.is_owned_cycle(), true, "Method 'is_owned_cycle' did not return the expected result.");
	});
	it('Is Owned Cycle with Args',function(){
		var opts=merge(true, freebandnames_query, {
				'ident':'TEST',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			}),
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);

		var harvester=new TweetHarvest(opts);
		assert.strictEqual(harvester.is_owned_cycle(harvester.model({}), {'ident':harvester.ident}), true, "Method 'is_owned_cycle' did not return the expected result.");
	});
	it('Is Owned Cycle - False Result',function(){
		var opts=merge(true, freebandnames_query, {
				'ident':'TEST',
				'doc_root':file_paths.doc_root,
				'path':file_paths.path
			}),
			cache_file_name=opts.ident + '_info.json',
			full_path=file_paths.doc_root + file_paths.path + cache_file_name;
		switchFsMockToStub(sinon_objs, file_paths.doc_root, true, file_paths.path, true);

		var harvester=new TweetHarvest(opts);
		assert.strictEqual(harvester.is_owned_cycle(harvester.harest_data, {'ident':'ABC123'}), false, "Method 'is_owned_cycle' did not return the expected result.");
	});
	it.only('Consume API',function(done){
		var opts=merge(true, freebandnames_query, {
				'ident':'TEST'
			});
//client.get(path, params, callback);
		var harvester=new TweetHarvest(opts);

		addTweetStub(harvester.twitter_client, 'search/tweets.json', harvester.query(), null, merge(true,freebandnames_tweets), {});
		addWriteFileStub(null, harvester.fullpath());
		addInstanceStartStub(harvester, null, {
			'count': harvester.harvest_data.count,
			'expire': 1,
			'ident': opts.ident,
			'max_id': harvester.harvest_data.max_id,
			'modified_stamp': harvester.harvest_data.modified_stamp.toJSON(),
			'next_results': freebandnames_tweets.next_results,
			'query': freebandnames_tweets.query,
			'since_id': freebandnames_tweets.since_id,
			'thread': harvester.thread
		});

		harvester.consume(function(err, info){
			sinon.assert.callCount(sinon_objs.tweet_stub_get, 1);
			assert.strictEqual(err, null, "Error should be null when successful.");
			done();
		});
	});
	it('Consume API - Throw Error on Start',function(done){//this shouldn't happen but we want to be sure
		var err_str="Something went wrong.",
			opts=merge(true, freebandnames_query, {
				'ident':'TEST'
			});
		var harvester=new TweetHarvest(opts);
		// addTweetStub(harvester.twitter_client, 'search/tweets.json', harvester.query(), null, merge(true,freebandnames_tweets), {});
		require_swap.request={'base_obj':request, 'methods':{'defaults': request.defaults}};
		request.defaults=function(){throw new Error(err_str);};

		assert.throws(function(){
			harvester.consume(function(err, info){
				setTimeout(function(){
					assert.instanceOf(err, Error, "Error was not passed into the callback.");
					assert.strictEqual(err.message, err_str, "Error recieved was not the expected message.");
					assert.deepEqual(info.twitter, {
						'consumer_key': config.API.api_key,
						'consumer_secret': config.API.secret,
						'access_token_key': config.API.access_token,
						'access_token_secret': config.API.access_secret,
					}, "Info was not passed into the callback.");
					done();
				},0);
			});
		}, err_str);
	});
	xit('xxxxxxx',function(){
	});
	afterEach(function(){
		for(var k in sinon_objs){
			if(typeof sinon_objs[k].restore==='function'){sinon_objs[k].restore();}
			else if(typeof sinon_objs[k].reset==='function'){sinon_objs[k].reset();}
		}
		sinon_objs={};

		for(var k in require_swap){
			var base=require_swap[k].base_obj;
			for(var method in require_swap[k].methods){
				base[method]=require_swap[k].methods[method];}
		}
		require_swap={};
	});
});
function switchFsMockToStub(sinon_objs, docRoot, docResult, path, pathResult){
	sinon_objs.fs_mock.restore();
	sinon_objs.fs_mock=sinon.stub(fs,'existsSync');
	sinon_objs.fs_mock.withArgs(docRoot).returns(docResult);
	sinon_objs.fs_mock.withArgs(docRoot + path).returns(pathResult);

}
// function addWriteFileMock(docRoot, path){
// 	sinon_objs.fs_mock.expects('writeFile').withArgs(docRoot + path).once();
// }
function addWriteFileStub(err, path){
	sinon_objs.writefile_mock=sinon.stub(fs,'writeFile');
	sinon_objs.writefile_mock.withArgs(path).yields(err);
}
function addInstanceStartStub(harvester, err, res, ownedResult){
	if(typeof(res)==='undefined'){res={};}
	if(typeof(err)==='undefined'){err=null;}
	if(typeof(ownedResult)==='undefined'){ownedResult=true;}
	sinon_objs.instance_save=sinon.stub(harvester, 'save');
	sinon_objs.instance_save.yields(err, res);
	sinon_objs.instance_is_owned=sinon.stub(harvester, 'is_owned_cycle');
	sinon_objs.instance_is_owned.returns(ownedResult);

}
function addTweetStub(client, uri, queryObj, err, body, response){
	sinon_objs.tweet_stub_get=sinon.stub(client, 'get');
	sinon_objs.tweet_stub_get.withArgs(uri, queryObj).yields(err, body, response);
}
