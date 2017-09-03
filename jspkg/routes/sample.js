
module.exports = function(genHTTP,API){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
	var Route=require('./index.js')(genHTTP, API),
		self_init=function(opts){//private methods
            var self=this;
        };

    //statics
    var schema={
		'pattern':new RegExp('^xxxxxx\/([0-9]+)','gi')
	};

    function RouteSample(opts){
        if(!opts){opts={};}
        Route.prototype.constructor.apply(this,[opts]);//extend parent constructor 'super()'

        //model setter!
        for(var s in schema){//set schema default
            if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
	};
    RouteSample.prototype=Object.create(Route.prototype);//extend parent
    RouteSample.prototype.constructor=RouteSample;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    return RouteSample;
}
