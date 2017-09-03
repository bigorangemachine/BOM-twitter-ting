var path = require('path'),
	merge = require('merge'),
	sinon = require('sinon'),
	assert = require('chai').assert,
	APIResponse = require(path.join(process.cwd(),'./jspkg/apiResponse'))(),
	response_types={
		'json':{'response':JSON.stringify, 'headers':[{'Content-Type':'text/json'}]},
		'xml':{'response':require('xml'), 'headers':[{'Content-Type':'text/xml'}]}
	};

describe('API Response',function(){
	it('No Options - Use defaults',function(){
		var API=new APIResponse();

		assert.deepEqual(API.response_success, {'code': 200, 'success': true, 'error': null }, "Initializing Instance does not contain the correct values for key 'response_success'.");
		assert.deepEqual(API.response_failed, {'code': 400, 'success': false, 'error': 'Request is not found.'}, "Initializing Instance does not contain the correct values for key 'response_failed'.");
		assert.deepEqual(API.response, {
			'payload': {},
			'status': {'code': 400, 'success': false, 'error': 'Request is not found.'}
		}, "Initializing Instance does not contain the correct values for key 'response'.");
		assert.strictEqual(API.output_type, 'json', "Initializing Instance does not contain the correct values for key 'output_type'.");
		assert.deepEqual(API.response_types, response_types, "Initializing Instance does not contain the correct values for key 'response_types'.");
	});
	it('With Options - Defaults can be changed',function(){
		var failed_obj={'code':400,'success':false,'valid':false,'error':"Invalid"},
			opts={
				'output_type':'xml',
				'response_failed':failed_obj,
				'response_success':{'code':200,'success':true,'valid':true,'error':null},
				'response':{'payload':{},'status':merge(true,{},failed_obj),'stamp':new Date()}
			},
			API=new APIResponse(opts);

		assert.deepEqual(API.response_success, opts.response_success, "Initializing Instance does not contain the correct values for key 'response_success'.");
		assert.deepEqual(API.response_failed, opts.response_failed, "Initializing Instance does not contain the correct values for key 'response_failed'.");
		assert.deepEqual(API.response, opts.response, "Initializing Instance does not contain the correct values for key 'response'.");
		assert.strictEqual(API.output_type, 'xml', "Initializing Instance does not contain the correct values for key 'output_type'.");
		assert.deepEqual(API.response_types, response_types, "Initializing Instance does not contain the correct values for key 'response_types'.");
	});
	it('Success Response',function(){
		var response_obj={'send':function(){},'setHeader':function(){}},
			response_data={'id':5555},
			mocked_response=sinon.mock(response_obj),
			API=new APIResponse();
		mocked_response.expects('send').withArgs('{"id":5555}').once();
		mocked_response.expects('setHeader').withArgs('Content-Type', 'text/json').once();

		API.respond(response_obj, response_data);
		mocked_response.verify();
	});
	it('Success Response with Extra Headers & XML',function(){
		var extra_header=[{'Context':'unittest'}],
			response_obj={'send':function(){},'setHeader':function(){},'status':function(){}},
			response_data={'answer':42},
			mocked_response=sinon.mock(response_obj),
			API=new APIResponse({'output_type':'xml'});
		mocked_response.expects('send').withArgs('<answer>42</answer>').once();
		mocked_response.expects('setHeader').withArgs('Content-Type', 'text/xml').once();
		mocked_response.expects('setHeader').withArgs(Object.keys(extra_header[0])[0], extra_header[0].Context).once();

		API.fail(response_obj, response_data, extra_header);
		mocked_response.verify();
	});
	it('Fail Response',function(){
		var response_obj={'send':function(){},'setHeader':function(){},'status':function(){}},
			response_data={'error':"Something went wrong"},
			mocked_response=sinon.mock(response_obj),
			API=new APIResponse();
		mocked_response.expects('send').withArgs('{"error":"Something went wrong"}').once();
		mocked_response.expects('setHeader').withArgs('Content-Type', 'text/json').once();
		mocked_response.expects('status').withArgs(404).once();

		API.fail(response_obj, response_data);
		mocked_response.verify();
	});
});
