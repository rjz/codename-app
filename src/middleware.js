'use strict'

var _ = require('lodash');
var errors = require('http-error-factories');

const DEFAULT_ERROR_MESSAGE = 'Something terrible has happened';

function sendError (res, err) {
  res.format({
    json () {
      res.status(err.code).json({ message: err.message })
    }
  })
}

module.exports = (logger, codename) => {

  return {

    ensureQueryHas (name) {
      return (req, res, next) => {
        if (!_.has(req.query, name) || _.isEmpty(req.query[name])) {
          return next(errors.badRequest(name + ' parameter is required'));
        }
        next();
      };
    },

    errorHandler (err, req, res, next) {

      if (!err.code) {
        logger.error({ err });
        err = new errors.internalServer(DEFAULT_ERROR_MESSAGE);
      }
      if (err instanceof errors.BadRequestError) {
        logger.info({ err });
      }
      else if (err instanceof errors.NotFoundError) {
        logger.info({ err });
      }
      else {
        logger.error({ err });
      }

      sendError(res, err);
    },

    // For use with bunyan.
    requestLogger (req, res, next) {
      let _end = res.end;
      const t0 = Date.now();

      res.end = function () {
        logger.info({ req, res, dt: (Date.now() - t0) })
        _end.apply(this, arguments);
      }

      next();
    }
  }
};

