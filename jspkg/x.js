
module.exports = function(parentOOPmodule){//dependancies and parentOOP protoptype/classes
    var utils=require('bom-utils'),merge=require('merge'),_=require('underscore');
    //var parentOOPmodule=require('parentOOPmodule')(); <- expected
    var self_init=function(opts){//private methods
            var self=this;
        };

    //statics
    var schema={'some':'thing','foo':'bar'};

    function OOPmodule(opts){
        if(!opts){opts={};}

        //private variables - need to be objects
        var protected_obj={'private':'thing'},
            protected_getter=function(keyIn){return function(){
				/* istanbul ignore next */
				return (protected_obj[keyIn] instanceof Array || protected_obj[keyIn].constructor===Object?utils.clone(protected_obj[keyIn]):protected_obj[keyIn]);
			}},
            protected_setter=function(keyIn){
				/* istanbul ignore next */
				return function(v){protected_obj[keyIn]=v;
			}},
            readonly_obj={'readonlyitem':'publickey'},
            readonly_getter=function(keyIn){return function(){return readonly_obj[keyIn]}};
        /* istanbul ignore next */
        if((typeof(Object.defineProperty)!=='function' && (typeof(this.__defineGetter__)==='function' || typeof(this.__defineSetter__)==='function'))){//use pre IE9
            //protected
            this.__defineSetter__('private', protected_getter('private'));
            this.__defineGetter__('private', protected_setter('private'));

            //readonly
            this.__defineGetter__('readonlyitem', readonly_getter('readonlyitem'));
        }else{
            //protected
            Object.defineProperty(this, 'private', {'set': protected_setter('private'),'get': protected_getter('private')});

            //readonly
            Object.defineProperty(this, 'readonlyitem', {'get': readonly_getter('readonlyitem')});
        }

        //model setter!
        for(var s in schema){//set schema default
			/* istanbul ignore else */
            if(utils.obj_valid_key(schema, s)){this[s]=(typeof(opts[s])!=='undefined'?opts[s]:schema[s]);}}

        this.xxxxx={'limit':{'row_count':(typeof(opts)!=='undefined' && typeof(opts.xxxxx)==='number'?opts.xxxxx:9000)}};
		self_init.apply(this,[opts]);//start! self_init that passes the 'this' context through
        parentOOPmodule.prototype.constructor.apply(this,[opts]);//extend parent constructor :D - do this here? or earlier
	};
    OOPmodule.prototype=Object.create(parentOOPmodule.prototype);//extend parent
    OOPmodule.prototype.constructor=OOPmodule;//reinforce typing (debugger shows correct model when you do this but it doesn't really make a difference unless you are type crazy)

    //public methods
    OOPmodule.prototype.method_defined=function(){
        var self=this;
    };

    return OOPmodule;
}
