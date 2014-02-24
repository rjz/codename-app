var errors = require('./errors');

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

// Argument is a bunyan-compatible logger
module.exports = function (logger) {

  var exports = {};

  function sendError (res, err) {
    res.format({
      json: function () {
        res.json(err.status, {
          status: err.status,
          description: err.message
        });
      }
    });
  }

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

  exports.errorHandler = function errorHandler (err, req, res, next) {

    if (!err.status) {
      // Something went unhandled...
      logger.error({ err: err });
      return sendError(res, errors.internal());
    }

    switch (err.name) {
      case 'internal':   logger.error({ err: err }); break;
      case 'notFound':   logger.warn({ err: err }); break;
      case 'badRequest': logger.info({ err: err }); break;
      default: logger.warn({ err: err });
    }

    sendError(res, err);
  };

  // For use with bunyan.
  exports.requestLogger = function requestLogger (req, res, next) {
    logger.info({ req: req, res: res });
    next();
  };

  return exports;
};

