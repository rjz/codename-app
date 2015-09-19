var _ = require('lodash'),
    bunyan = require('bunyan'),
    express = require('express'),
    createServer = require('leadballoon'),
    errors = require('http-error-factories'),
    path = require('path');

var codename = require('codename')();
var config = require('./src/config');

var logger = bunyan.createLogger({
  name: 'Blistering Honeybee',
  serializers: _.extend(bunyan.stdSerializers, {
    req: function (req) {
      return {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl
      };
    },
    res: function (res) {
      return {
        status: res.statusCode
      };
    }
  }),
  level: config.logLevel
});

var mw = require(path.resolve(__dirname, 'src/middleware'))(logger);

var app = module.exports = express();

app.use(mw.requestLogger);
app.use(express.timeout(5000));

app.use(express.cookieParser());
app.use(express.session({
  key: config.sessionKey,
  secret: config.sessionSecret
}));

//app.use(mw.acceptTypes(['json','html']));

//app.use(express.static(path.resolve(__dirname, 'client')));

app.use(mw.index); // catch-all for HTML requests

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
logger.info('Listening', { port: config.port });

var server = createServer(app, {
  timeout: config.requestTimeout
});

server.listen(config.port);

server.on('close', function (err) {
  if (err) {
    logger.error('Went down hard', { err: err });
    process.exit(1);
  }

  process.exit(0);
});

