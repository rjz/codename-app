var confab = require('confab');
var path = require('path');

module.exports = confab([
  confab.loadJSON([
    path.resolve(__dirname, '../config/default.json')
  ]),
  confab.loadEnvironment({
    'PORT'           : 'port',
    'SESSION_KEY'    : 'sessionKey',
    'SESSION_SECRET' : 'sessionSecret'
  }),
  confab.defaults({
    'port'           : 3202,
    'requestTimeout' : 5000,
    'sessionKey'     : 'sess',
    'sessionSecret'  : 'hopelessly insecure'
  })
]);


