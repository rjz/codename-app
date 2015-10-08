'use strict'

var koa = require('koa');
var route = require('koa-route');
var cors = require('koa-cors');
var assets = require('koa-static');
var errors = require('http-error-factories');
var codename = require('codename')();

var hogan = require('hogan.js');
var fs = require('fs');
var path = require('path');

const templatePath = path.resolve(__dirname, './client/index.hogan')
const templateString = fs.readFileSync(templatePath).toString()
const template = hogan.compile(templateString)

function apiRoute (path) {
  return '/api' + path;
};

module.exports = (config, logger) => {

  var app = koa();

  var mw = require('./src/middleware')(logger, codename);

  const lists = codename.lists()
  const filters = codename.filters()

  app.use(mw.requestLogger);
  app.use(mw.handleError);
  app.use(cors());

  app.use(route.get(apiRoute('/lists'), function *() {
    if (!this.accepts('json')) throw errors.notAcceptable();
    this.body = lists
  }))

  app.use(route.get(apiRoute('/filters'), function *() {
    if (!this.accepts('json')) throw errors.notAcceptable();
    this.body = filters
  }))

  app.use(route.get(apiRoute('/codenames'), function *() {

    if (!this.query.lists)
      throw errors.badRequest('no lists specified');

    if (!this.query.filters)
      throw errors.badRequest('no filters specified');

    const listNames = this.query.lists.split(',');
    const filters = this.query.filters.split(',');

    const result = codename.generate(filters, listNames);

    if (result instanceof ReferenceError) {
      throw errors.notFound(result.message);
    }
    this.body = [result.join(' ')];
  }));

  app.use(route.get('/', function *() {

    const props = { name: 'world' };

    let title = 'Codenames.';
    let html = '<div id="codename"></div>';

    this.body = template.render({ title, html });
  }));

  app.use(assets(path.resolve(__dirname, 'client')));

  app.use(function *() {
    throw errors.notFound(`Not found ${this.originalUrl}`);
  });

  return app;
};

