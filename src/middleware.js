var errors = require('./errors');

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

