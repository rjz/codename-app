var _ = require('lodash');
var errors = require('http-error-factories');

var hogan = require('hogan.js'),
    fs = require('fs'),
    path = require('path');

var templateDir = './client/templates',
    templates = {};

// Read in templates
fs.readdirSync(templateDir).forEach(function (entry) {
  var name;
  if (path.extname(entry) === '.hogan') {
    name = path.basename(entry, '.hogan');
    templates[name] = hogan.compile(fs.readFileSync(path.join(templateDir, entry)).toString());
  }
});

function sendError (res, err) {
  res.format({
    json: function () {
      res.json(err.status, err.toJSON());
    }
  });
}

module.exports = function (logger) {

  var exports = {};

  exports.index = function (req, res, next) {

    var lists = [
      { id: 'foo', title: 'bar', name: 'foo', value: 'baz' }
    ];

    res.format({
      html: function () {
        res.send(templates.layout.render({ lists: lists.map(function (x) {
          return templates.checkbox.render(x);
        })}));
      },
      json: function () {
        next();
      }
    });
  };

  exports.acceptTypes = function (types) {
    return function acceptTypes (req, res, next) {
      if (req.accepts(types)) return next();
      next(errors.notAcceptable());
    };
  };

  exports.ensureQueryHas = function (name) {
    return function ensureQueryHas (req, res, next) {
      if (!_.has(req.query, name) || _.isEmpty(req.query[name])) {
        return next(errors.badRequest(name + ' parameter is required'));
      }
      next();
    };
  };

  exports.errorHandler = function errorHandler (err, req, res, next) {

    if (!errors.hasOwnProperty(err.name)) {
      // Something went unhandled...
      logger.error({ err: err });
      return sendError(res, errors.internalServerError());
    }

    switch (err.name) {
      case 'internal'   : logger.error({ err: err }); break;
      case 'notFound'   : logger.warn({ err: err }); break;
      case 'badRequest' : logger.info({ err: err }); break;
      default           : logger.warn({ err: err });
    }

    sendError(res, err);
  };

  // For use with bunyan.
  exports.requestLogger = function requestLogger (req, res, next) {
    var _end = res.end,
        t0 = Date.now();

    res.end = function () {
      logger.info({
        req: req,
        res: res,
        dt: (Date.now() - t0)
      });

      _end.apply(this, arguments);
    };

    next();
  };

  return exports;
};

