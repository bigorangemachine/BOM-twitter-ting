
module.exports = function(mysql){

    //private dependancies
    var genericDB=require('GenDB')(mysql),utils=require('bom-utils'),merge=require('merge'),_=require('underscore');

    //private scope
    var self_init=function(){
            this.add_schema({'col_name': 'id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'primary'});
			this.add_schema({'col_name': 'query_val', 'is_null': false, 'is_base': true, 'size': 255, 'val_type': 'string'});
            this.add_schema({'col_name': 'criteria_type_id', 'is_null': false, 'is_base': true, 'size': 20, 'val_type': 'int', 'key_type': 'index'});
        };
    function criteraDB(opts){
        genericDB.apply(this, Array.prototype.slice.call(arguments));//extend OOP Class
        this.table_index=merge(true,{},{'criteria':this.table_schema()});//clean out the old schema set by parent constructor
        this.table_index.criteria.table_name='criteria';

        self_init.apply(this);//self_init that passes the 'this' context through
    }
    criteraDB.prototype=Object.create(genericDB.prototype);//extend OOP Class
    criteraDB.prototype.constructor=genericDB;

    // criteraDB.prototype.xxxxxx=function(){
    // };

    return criteraDB;
};
