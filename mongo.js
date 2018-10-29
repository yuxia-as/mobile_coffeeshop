
function MongodbModel(dbName,collectionName) {
    var MongoClient;
    var DB_CONN_STR;
    /* connect database */ 
    this.init = function() {
        MongoClient = require('mongodb').MongoClient;
        DB_CONN_STR = 'mongodb://localhost:27017';
    }
    /*insert data*/
    this.insert = function(data,callback) {
        MongoClient.connect(DB_CONN_STR, function(err, client) {
            if(err) throw err;
            var db = client.db(dbName);
            var collection = db.collection(collectionName);
            collection.insert(data, function(err,result){
                callback(err,result);
            })
            client.close();
        })
    }
    /*delete data*/
    this.remove = function(data,callback){
        MongoClient.connect(DB_CONN_STR, function(err, client) {
            var db = client.db(dbName);
            var collection = db.collection(collectionName);
            collection.remove(data, function(err,result){
                callback(err,result);
            })
            client.close();
        })
    }
    /*update data*/
    this.update=function(data,updatedata,callback){
        MongoClient.connect(DB_CONN_STR, function(err, client) {
            var db = client.db(dbName);
            var collection = db.collection(collectionName);
            collection.update(data,updatedata,function(err,data){
                callback(err,data);
            })
            client.close();
        })
    }
    /*find data*/
    this.find=function(data,callback){
        MongoClient.connect(DB_CONN_STR, function(err, client) {
            var db = client.db(dbName);
            var collection = db.collection(collectionName);
            collection.find(data).toArray(function(err,data){
                callback(err,data);
            })
            client.close();
        })
    }
}

module.exports = MongodbModel;