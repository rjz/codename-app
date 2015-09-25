'use strict'

var errors = require('http-error-factories');

const DEFAULT_ERROR_MESSAGE = 'Something terrible has happened';

module.exports = (logger, codename) => {

  return {

    *handleError (next) {

      const DEFAULT_ERROR_MESSAGE = 'Something terrible has happened';

      try {
        yield next
      }
      catch (err) {
        if (!err.code) {
          logger.error({ err }, 'Unknown error');
          err = errors.internalServer(DEFAULT_ERROR_MESSAGE);
        }
        else if (err instanceof errors.BadRequestError) {
          logger.info({ err });
        }
        else if (err instanceof errors.NotFoundError) {
          logger.info({ err });
        }
        else {
          logger.error({ err });
        }

        this.status = err.code;
        this.body = {
          message: err.message,
          status: err.code
        };

        this.app.emit('error', err, this);
      }
    },

    // For use with bunyan.
    *requestLogger (next) {
      const t0 = Date.now();

      yield next

      logger.info({
        url: this.originalUrl,
        method: this.method,
        status: this.status,
        dt: (Date.now() - t0)
      })
    }
  }
};

