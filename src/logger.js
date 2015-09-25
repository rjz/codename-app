var bunyan = require('bunyan');

module.exports = function (config) {
  return bunyan.createLogger({
    name: 'Blistering Honeybee',
    stream: process.stderr,
    serializers: Object.assign({}, bunyan.stdSerializers, {
      err: bunyan.stdSerializers.err,
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
};

