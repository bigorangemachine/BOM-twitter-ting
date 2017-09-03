var path = require('path'),
	merge = require('merge'),
	sinon = require('sinon'),
	assert = require('chai').assert,
	utils = require('bom-utils'),
	freebandnames_query = require(path.join(process.cwd(),'./tests/mocks/query.freebandnames.json')),
	cobracommander_query = require(path.join(process.cwd(),'./tests/mocks/query.cobracommander.json')),
	HarvestModel = require(path.join(process.cwd(),'./jspkg/tweet_harvest/harvest.model')),
	sinon_objs={};

describe('Tweet Harvest Model',function(){
	beforeEach(function(){
	});
	it('Initalize',function(){
		var rand_num=123456;
		sinon_objs.utils_rand_int=sinon.stub(utils,'getRandomInt');
		sinon_objs.utils_rand_int.withArgs(111111, 999999).returns(rand_num);
		var sandbox = sinon.sandbox.create(),
			opts={
				'expire':10,
				'next_results':freebandnames_query.next_results,
				'count':freebandnames_query.count,
				'max_id':freebandnames_query.max_id,
				'since_id':freebandnames_query.since_id,
				'query':freebandnames_query.query,
				'modified_stamp':'2017-08-25T17:43:46.637Z',
				'log_file':'harvest10101.json'
			},
			future_date = new Date(new Date().getTime() + 5000 * 60 * 1000),
			clock = sinon.useFakeTimers(future_date.getTime()),
			test_model=new HarvestModel(opts);

		assert.typeOf(test_model.unique_id, 'string', "Unique ID was not generated as a string");
		assert.match(test_model.unique_id, /[0-9]+\-[0-9]{6}/gi, "Unique ID was not generated correctly");
		assert.strictEqual(test_model.modified_stamp.toISOString(), new Date(opts.modified_stamp).toISOString(), "Modified Stamp is not the expected value");

		assert.deepEqual({
			'unique_id':test_model.unique_id,
			'modified_stamp':test_model.modified_stamp.toJSON(),
			'count':test_model.count,
			'expire':test_model.expire,
			'next_results': test_model.next_results,
			'max_id': test_model.max_id,
			'since_id': test_model.since_id,
			'query': test_model.query
		}, {
			'unique_id':future_date.getTime().toString()+'-'+rand_num,
			'modified_stamp':(new Date(opts.modified_stamp)).toJSON(),
			'count':opts.count,
			'expire':10,
			'next_results': freebandnames_query.next_results,
			'max_id': freebandnames_query.max_id,
			'since_id': freebandnames_query.since_id,
			'query': freebandnames_query.query
		}, "Data retrieved is not the expected object.");
		clock.restore();
		sandbox.restore();
	});
	it('Initalize - No Options',function(){
		var sandbox = sinon.sandbox.create(),
			simulated_date = new Date('2017-08-25T17:43:46.637Z'),
			clock = sinon.useFakeTimers(simulated_date.getTime()),
			test_model=new HarvestModel();
		assert.strictEqual(test_model.log_file, 'harvest.json', "Log File was not the expected value");
		assert.strictEqual(test_model.expire, 1, "Expiration number is not the expected value");

		assert.deepEqual({
			// 'unique_id':test_model.unique_id, // this is generated don't worry about it
			'modified_stamp':test_model.modified_stamp.toJSON(),
			'count':test_model.count,
			'expire':test_model.expire,
			'next_results': test_model.next_results,
			'max_id': test_model.max_id,
			'since_id': test_model.since_id,
			'query': test_model.query
		}, {
			// 'unique_id':test_model.unique_id, // this is generated don't worry about it
			'modified_stamp':simulated_date.toJSON(),
			'count':100,
			'expire':1,
			'next_results': '',
			'max_id': '',
			'since_id': '',
			'query': ''
		}, "Data retrieved is not the expected object.");
		clock.restore();
		sandbox.restore();
	});
	it('Scope Integrity',function(){
		var opts1=freebandnames_query,
			opts2=cobracommander_query,
			test_model1=new HarvestModel(merge(true,{},opts1)),
			test_model2=new HarvestModel(merge(true,{},opts2));

		test_model1.next_results='?max_id=123466&q=%23freebunnames&count=10&include_entities=1&result_type=mixed';
		test_model1.max_id=123466;
		test_model1.since_id=123000;
		test_model1.query='%23freebunnames';

		//no overlapping values
		assert.notStrictEqual(test_model1.next_results, test_model2.next_results, "Next Results scope is broken");
		assert.notStrictEqual(test_model1.max_id, test_model2.max_id, "Max ID scope is broken");
		assert.notStrictEqual(test_model1.since_id, test_model2.since_id, "Since ID scope is broken");
		assert.notStrictEqual(test_model1.query, test_model2.query, "Query scope is broken");
		assert.notStrictEqual(test_model1.count, test_model2.count, "Count scope is broken");
		assert.notStrictEqual(JSON.stringify(test_model1), JSON.stringify(test_model2), "JSON Conversion is broken");

		//values can be changed
		assert.notStrictEqual(test_model1.next_results, opts1.next_results, "Next Results value is unchanged");
		assert.notStrictEqual(test_model1.max_id, opts1.max_id, "Max ID value is unchanged");
		assert.notStrictEqual(test_model1.since_id, opts1.since_id, "Since ID value is unchanged");
		assert.notStrictEqual(test_model1.query, opts1.query, "Query value is unchanged");
	});
	it('Has Expired - True',function(){
		var sandbox = sinon.sandbox.create(),
			test_model=new HarvestModel(),
			future_date = new Date(new Date().getTime() + 1.01 * 60 * 1000),
			clock = sinon.useFakeTimers(future_date.getTime());
		assert.strictEqual(test_model.has_expired(), true, "Has Expired did not return the expected result of true");
		clock.restore();
		sandbox.restore();
	});
	it('Has Expired - False',function(){
		var sandbox = sinon.sandbox.create(),
			test_model=new HarvestModel(),
			past_date = new Date(new Date().getTime() - 1.01 * 60 * 1000),
			clock = sinon.useFakeTimers(past_date.getTime());
		assert.strictEqual(test_model.has_expired(), false, "Has Expired did not return the expected result of false");
		clock.restore();
		sandbox.restore();
	});
	it('Date Stamp updates when model has changed',function(){
		var sandbox = sinon.sandbox.create(),
			test_model=new HarvestModel(),
			future_date = new Date(new Date().getTime() + 5 * 60 * 1000),// 5 mins in the future
			clock = sinon.useFakeTimers(future_date.getTime());

		test_model.next_results=freebandnames_query.next_results;

		assert.strictEqual(test_model.modified_stamp.toJSON(), future_date.toJSON(), "Date stamp was not updated on change.");
		clock.restore();
		sandbox.restore();
	});
	afterEach(function(){
		for(var k in sinon_objs){
			if(typeof sinon_objs[k].restore==='function'){sinon_objs[k].restore();}
			else if(typeof sinon_objs[k].reset==='function'){sinon_objs[k].reset();}
		}
		sinon_objs={};
	});
});
