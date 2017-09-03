var path = require('path'),
	merge = require('merge'),
	sinon = require('sinon'),
	assert = require('chai').assert;

// create coverage for these files
require(path.join(process.cwd(),'./jspkg/routes'))();
// require(path.join(process.cwd(),'./jspkg/routes/sample'))();
require(path.join(process.cwd(),'./jspkg/apiResponse'))();
require(path.join(process.cwd(),'./jspkg/tweet_harvest'))();

// mocha statment will include the subfolders; otherwise you'll need the following:
// require(path.join(process.cwd(),'./tests/jspkg/apiResponse'));
// require(path.join(process.cwd(),'./tests/jspkg/routes'));
