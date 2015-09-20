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
      res.status(err.code)
        .json({ message: err.toJSON().message });
    }
  });
}

module.exports = function (logger, codename) {

  var exports = {};

  var listsTemplate = codename.lists().map(function (x) {
    return templates.checkbox.render(x);
  });

  var filtersTemplate = codename.filters().map(function (x) {
    return templates.checkbox.render(x);
  });

  exports.index = function (req, res, next) {
    res.format({
      html: function () {
        res.send(templates.layout.render({
          lists: listsTemplate,
          filters: filtersTemplate
        }));
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
    if (err instanceof errors.BadRequestError) {
      logger.info({ err: err });
    }
    else if (err instanceof errors.NotFoundError) {
      logger.info({ err: err });
    }
    else {
      logger.error({ err: err });
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

