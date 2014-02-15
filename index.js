var _ = require('lodash'),
    bunyan = require('bunyan'),
    express = require('express'),
    path = require('path');

var codename = require('codename')();

var logger = bunyan.createLogger({
  name: 'Blistering Honeybee',
  serializers: bunyan.stdSerializers
});

var mw = require(path.resolve(__dirname, 'src/middleware'))(logger),
    errors = require(path.resolve(__dirname, 'src/errors'));

var app = module.exports = express();

app.use(express.timeout(5000));
app.use(mw.requestLogger);

// GET /lists
// GET /filters
['filters', 'lists'].forEach(function (k) {
  var data = codename[k]();
  app.get('/' + k, function (req, res, next) {
    res.json(200, data);
  });
});

app.post('/codenames', function (req, res, next) {

  var filters, listNames;

  if (!_.has(req.query, 'lists') || _.isEmpty(req.query.lists)) {
    return next(errors.badRequest('No lists specified'));
  }

  if (!_.has(req.query, 'filters') || _.isEmpty(req.query.filters)) {
    return next(errors.badRequest('No filters specified'));
  }

  listNames = req.query.lists.split(',');
  filters = req.query.filters.split(',');

  res.send(200, [codename.generate(filters, listNames).join(' ')]);
});

app.use(app.router);

app.all('*', function (req, res, next) {
  next(errors.notFound(req.url));
});

app.use(mw.errorHandler);
app.listen(3202);

