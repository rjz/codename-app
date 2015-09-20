'use strict'

var express = require('express');
var errors = require('http-error-factories');
var codename = require('codename')();

var React = require('react');
var hogan = require('hogan.js');
var fs = require('fs');
var path = require('path');

const templatePath = path.resolve(__dirname, './client/templates/layout.hogan')
const templateString = fs.readFileSync(templatePath).toString()
const template = hogan.compile(templateString)

require('node-jsx').install();

let HelloWorldComponent = require('./components/HelloWorld.jsx');

module.exports = (config, logger) => {

  var app = express();

  var mw = require('./src/middleware')(logger, codename);

  const lists = codename.lists()
  const filters = codename.filters()

  app.use(mw.requestLogger);

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

  app.get('/', (req, res) => {
    res.format({
      text () {
        res.send('OK');
      },
      json () {
        res.json({});
      },
      html: function () {

        const props = { name: 'world' };

        let title = 'Codenames.'

        res.send(template.render({ title,
          html: React.renderToString(React.createElement(HelloWorldComponent, props))
        }));
      }
    })
  })

  app.use(app.router);

  app.all('*', (req, res, next) => {
    next(errors.notFound(req.url));
  });

  app.use(mw.errorHandler);

  return app;
};

