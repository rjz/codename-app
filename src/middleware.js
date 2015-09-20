'use strict'

var _ = require('lodash');
var errors = require('http-error-factories');

var hogan = require('hogan.js'),
    fs = require('fs'),
    path = require('path');

var React = require('react');

let HelloWorldComponent = require('../components/HelloWorld.jsx');

const DEFAULT_ERROR_MESSAGE = 'Something terrible has happened';

const templatePath = path.resolve(__dirname, '../client/templates/layout.hogan')
const templateString = fs.readFileSync(templatePath).toString()
const template = hogan.compile(templateString)

function sendError (res, err) {
  res.format({
    json () {
      res.status(err.code).json({ message: err.message })
    }
  })
}

module.exports = (logger, codename) => {

  return {

    index (req, res, next) {
      res.format({
        json () {
          return next()
        },
        html: function () {

          const props = { name: 'world' };

          let title = 'Codenames.'

          res.send(template.render({ title,
            html: React.renderToString(React.createElement(HelloWorldComponent, props))
          }));
        }
      })
    },

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

