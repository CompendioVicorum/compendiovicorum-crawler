const async = require('async');
const assert = require('assert');
const exec = require('child_process').exec;
var MongoClient = require('mongodb').MongoClient;
const { spawn, spawnSync } = require( 'child_process' );
var config = require('../config');
var utils = require('../utils');
const TIMEOUT_TIME = 1000 * 60 * 60 * 2; // 2 hours timeout

describe('Compendio Vicorum', function() {
  describe('execution', function() {
    child = spawn( 'node', [ 'app.js' ] );

    it('should connect to the MongoDB server', function(done) {
        this.timeout(TIMEOUT_TIME); //timeout with an error if done() isn't called within the given time
        /*
        async.series([
            exec('cd ..'),
            exec('node app.js')
        ]);
        */
        //child = spawn( 'node', [ 'app.js' ] );

        /*
        child.stdout.on('data', (data) => {
            console.log(`child stdout:\n${data}`);
        });
        
        child.stderr.on('data', (data) => {
            console.error(`child stderr:\n${data}`);
        });
        */

        child.on('exit', function (code, signal) {
            console.debug('child process exited with ' + `code ${code} and signal ${signal}`);
            assert.equal(code, 0);
            done();
        });
    });

    it('should retrieve provincia information', function(done) {
        this.timeout(TIMEOUT_TIME); //timeout with an error if done() isn't called within the given time

        child.on('exit', function (code, signal) {
            console.log('onexit test test');
            MongoClient.connect(url, function(err, db) {
                if(err){
                    console.log("Error connecting to server");
                    done();
                }
                
                var collection = db.collection(mongodb.collection);

                done();
                
                //Read the provincia information
                collection.find({}).toArray(function(err, docs) {
                    assert.equal(err, null);
                    docs.each(function(doc){
                        assert.isDefined(doc.provincia);
                    });
                    callback(docs);
                });
            });
        });
    });
  });
});