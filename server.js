'use strict';

var restify = require('restify');

var Acquirer = require('./data_acquisition').Acquirer;

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

var acquirer = new Acquirer();
acquirer.acquire();

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});