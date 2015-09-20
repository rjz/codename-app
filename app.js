var express = require('express');
var errors = require('http-error-factories');
var codename = require('codename')();

module.exports = function (config, logger) {

  var app = express();

  var mw = require('./src/middleware')(logger, codename);

  app.use(mw.requestLogger);

  app.use(express.cookieParser());
  app.use(express.session({
    key: config.sessionKey,
    secret: config.sessionSecret
  }));

  app.use(mw.index); // catch-all for HTML requests

  //app.use(mw.acceptTypes(['json','html']));

  //app.use(express.static(path.resolve(__dirname, 'client')));

  // GET /lists
  // GET /filters
  ['filters', 'lists'].forEach(function (k) {
    var data = codename[k]();
    app.get('/api/' + k, function (req, res, next) {
      res.json(200, data);
    });
  });

  app.get('/api/codenames',

    mw.ensureQueryHas('filters'),
    mw.ensureQueryHas('lists'),

    function (req, res, next) {

      var filters, listNames, result;

      listNames = req.query.lists.split(',');
      filters = req.query.filters.split(',');

      result = codename.generate(filters, listNames);

      if (result instanceof ReferenceError) {
        next(errors.notFound(result.message));
      }
      else {
        res.send(200, [result.join(' ')]);
      }
    });

  app.use(app.router);

  app.all('*', function (req, res, next) {
    next(errors.notFound(req.url));
  });

  app.use(mw.errorHandler);

  return app;
};

