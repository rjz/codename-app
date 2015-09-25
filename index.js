var _ = require('lodash'),
    createServer = require('leadballoon');

var config = require('./src/config');

var logger = require('./src/logger')(config);

var server = createServer(require('./app')(config, logger).callback(), {
  timeout: config.requestTimeout
});

server.listen(config.port);

logger.info('Listening', { port: config.port });

server.on('close', function (err) {
  if (err) {
    logger.error('Went down hard', { err: err });
    process.exit(1);
  }

  process.exit(0);
});

