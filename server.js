'use strict';

var restify = require('restify'),
	mongoose = require('mongoose');

var Acquirer = require('./data_acquisition').Acquirer,
	settings = require('./config');

var server = restify.createServer({
  name: 'WeCare',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

mongoose.connect(settings.database.uri, function(err) {
    if (err) {
        throw err;
    }

    var acquirer = new Acquirer();
	acquirer.acquire();

	server.listen((process.env.PORT || 5000), function () {
  	console.log('%s listening at %s', server.name, server.url);
	});
});





