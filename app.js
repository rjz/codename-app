'use strict'

var express = require('express');
var errors = require('http-error-factories');
var codename = require('codename')();

require('node-jsx').install();

module.exports = (config, logger) => {

  var app = express();

  var mw = require('./src/middleware')(logger, codename);

  const lists = codename.lists()
  const filters = codename.filters()

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
  app.get('/api/lists', (req, res, next) => {
    res.format({
      json () {
        res.json(lists);
      }
    })
  })

  // GET /filters
  app.get('/api/filters', (req, res, next) => {
    res.format({
      json () {
        res.json(filters);
      }
    })
  })

  app.get('/api/codenames',

    mw.ensureQueryHas('filters'),
    mw.ensureQueryHas('lists'),

    (req, res, next) => {

      const listNames = req.query.lists.split(',');
      const filters = req.query.filters.split(',');

      const result = codename.generate(filters, listNames);

      if (result instanceof ReferenceError) {
        next(errors.notFound(result.message));
      }
      else {
        res.send([result.join(' ')]);
      }
    });

  app.use(app.router);

  app.all('*', (req, res, next) => {
    next(errors.notFound(req.url));
  });

  app.use(mw.errorHandler);

  return app;
};

