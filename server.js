'use strict';

require('newrelic');

var restify = require('restify'),
	mongoose = require('mongoose');

var Acquirer = require('./data_acquisition').Acquirer,
  Aggregator = require('./data_rollup').Aggregator,
	settings = require('./config');

var server = restify.createServer({
  name: 'air-quality-crawler',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/health/', function (req, res, next) {
  res.send("Welcome! All is well!");
  return next();
});

var dbUri;
// check if run on heroku
if (process.env.NODE_ENV === 'production') {
  dbUri = settings.product_db.uri;
} else {
  dbUri = settings.database.uri;
}
mongoose.connect(dbUri, function(err) {
  if (err) {
    throw err;
  }

  var acquirer = new Acquirer();
  acquirer.start();

  var aggregator = new Aggregator();
  aggregator.start();

	server.listen((process.env.PORT || 5000), function () {
  	console.log('%s listening at %s', server.name, server.url);
	});
});





