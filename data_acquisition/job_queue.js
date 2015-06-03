var mongojs = require('mongojs');
var uuid    = require('uuid');
var _       = require('lodash');
var async   = require('async');

var settings = require('../config');

var dbUri;
// check if run on heroku
if (process.env.NODE_ENV === 'production') {
  dbUri = settings.product_db.uri;
} else {
  //dbUri = settings.database.jobs;
  dbUri = settings.product_db.uri;
}

var db = mongojs(dbUri);

var defaults = {
  maxAttempts : 1,
  maxAge      : false,
  concurrency : 1,
  priority    : 1,
  polling     : 200
};

/**
 * @param {string} channel name of the collection
 * @param {object} opts options
 * @param {function} handleJob may be executed several times
 */
module.exports = function(channel, opts) {
  var collection = db.collection(channel);
  opts = opts || {};
  _.defaults(opts, defaults);

  collection.ensureIndex({key: 1}, {unique: true, sparse: true});
  collection.ensureIndex({
    reserved: 1, createdAt: 1, attempts: 1, reservedAt: 1, priority: 1
  });

  // TODO rename to "running"
  var stopped = true;
  var finishedWorker = 0;
  var jobCount = 0;

  return {
    stop: function() {
      stopped = true;
    },

    /**
     * start / resume the queue
     */
    start: function() {
      if(!stopped) {
        return;
      }
      stopped = false;
      for(var i = 0; i < opts.concurrency; i++) {
        this.findJob();
      }
    },

    /**
     * find and reserve a job, process it
     */
    findJob: function() {
      if(stopped) {
        return;
      }
      var self = this;

      if (jobCount <= 0) {
        finishedWorker++;
        if (finishedWorker >= opts.concurrency) {
          return self.finishedCb();
        } else {
          return;
        }
      }

      jobCount--;


      var conditions = [{reserved: false}];
      if(opts.maxAge) {
        var maxDate = Date.now() - opts.maxAge * 1000;
        conditions.push({finished: false, reservedAt: {$lt: maxDate}});
      }

      collection.findAndModify({
        query: {
          $or: conditions,
          attempts: {$lt: opts.maxAttempts}
        },
        update: {
          $set: {
            reserved: true,
            reservedAt: Date.now()
          },
          $inc: {
            attempts: 1
          }
        },
        sort: {
          priority: -1, createdAt: -1
        },
        new: true // return the new document, though it doesn't actually matter...
      }, function(err, doc) {
        if(err) { return self.jobCb(err); }
        if(!doc) {
          return setTimeout(function() {
            self.findJob();
          }, opts.polling);
        }
        self.jobCb(doc.payload, function(err, result) {
          collection.remove({
            _id: doc._id
          //}, {
            //$set: {result: result, finished: true}
          }, function(err, res) {
            if(err) { return self.jobCb(err); }
            process.nextTick(function() {
              self.findJob();
            });
          });
        });
      });
    },

    createJob: function(key, payload, cb) {
      // TODO use matches for this
      if(!cb) {
        cb = payload;
        payload = key;
        key = uuid.v4();
      }

      jobCount++;

      collection.insert({
        key: key,
        state: 'new', // TODO use state instead of reserved and finished
        reserved: false,
        finished: false,
        createdAt: Date.now(),
        priority: opts.priority,
        payload: payload,
        attempts: 0
      }, cb);
    },

    onJob: function(jobCb) {
      this.jobCb = jobCb;
      //this.start();
      return this;
    },

    onError: function(errorCb) {
      this.errorCb = errorCb;
      return this;
    },

    onFinished: function(finishedCb) {
      this.finishedCb = finishedCb;
      return this;
    }
  };
};