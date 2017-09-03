var path = require('path'),
	merge = require('merge'),
	sinon = require('sinon'),
	assert = require('chai').assert,
	nock = require('nock'),
	request = require('supertest'),
	genericHTTP = require('node-default-server')(),
	APIResponse = require(path.join(process.cwd(),'./jspkg/apiResponse'))(),
	gen_HTTP=new genericHTTP({'ports':['3000'],'doc_root':'./'}),
	API=new APIResponse(),
	CatchAllRoute=require(path.join(process.cwd(),'./jspkg/routes/index.js'))(gen_HTTP,API);

describe('Routes',function(){
	beforeEach(function(){
		gen_HTTP.listeners={};
	});
	it('Catch all default',function(){
		var temproute=new CatchAllRoute();
		assert.strictEqual(String(temproute.pattern), '/.*/gi', "Default 'pattern' was not set correctly");
		assert.deepEqual(temproute.ports, [], "Default 'ports' was not set correctly");
		assert.deepEqual(temproute.methods, [], "Default 'methods' was not set correctly");
	});
	it('Catch all with options',function(){
		var temproute=new CatchAllRoute({ports: ['3000','80'],'methods': ['POST','GET'],'pattern':new RegExp('test\/[0-9]+','gi')});
		assert.strictEqual(String(temproute.pattern), '/test\\/[0-9]+/gi', "Option 'pattern' was not set correctly");
		assert.deepEqual(temproute.ports, ['3000','80'], "Option 'ports' was not set correctly");
		assert.deepEqual(temproute.methods, ['POST','GET'], "Option 'methods' was not set correctly");
	});
	it('Bind the Catch all Route with no arguments',function(){
		var temproute=new CatchAllRoute(),
			binded_count=Object.keys(gen_HTTP.listeners).length;
		temproute.bind();
		assert.notEqual(binded_count, Object.keys(gen_HTTP.listeners).length, "API was not binded");
	});
	it('Bind the Catch all Route with arguments',function(){
		var temproute=new CatchAllRoute(),
			binded_count=Object.keys(gen_HTTP.listeners).length;
		temproute.bind(function(){},function(){});
		assert.notEqual(binded_count, Object.keys(gen_HTTP.listeners).length, "API was not binded");
	});
	it('Bind the Catch all Route with stubbed callbacks',function(done){
		// var temproute=new CatchAllRoute({ports: ['3000'],'methods': ['GET'],'pattern':new RegExp('test\/[0-9]+','gi')});
		var temproute=new CatchAllRoute({ports: ['3000'],'methods': ['GET'],'pattern':new RegExp('test\/[0-9]+','gi')}),
			response_fake=merge(true,{},API.response,{'status':merge(true,{},API.response_failed)});
		this.timeout(5000);
		temproute.bind();
		request('http://localhost:3000').get('/test/123').expect(404).end(function(err, data){
			if(err){done(err);return;}

			assert.deepEqual(data.res.text, '{"payload":{},"status":{"code":400,"success":false,"error":"Request is not found."}}', "API Response contains unexpected values");
			done();
		});
	});
});
