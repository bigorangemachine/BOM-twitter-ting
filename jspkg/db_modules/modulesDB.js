
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('GenDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
            this.add_schema({'col_name': 'module', 'is_null': false, 'is_base': true, 'size': 255, 'val_type': 'string', 'key_type': 'index'});
        };
    function modulesDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'modules':this.table_schema()});//clean out the old schema set by parent constructor
        this.table_index.modules.table_name='JIRAGIT-modules';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    modulesDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    modulesDB.prototype.constructor=genericDB;

    modulesDB.prototype.xxxxxx=function(){
    }
    return modulesDB;
};
