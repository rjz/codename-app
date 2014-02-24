var path = require('path');

var Session = require('supertest-session')({
  app: require(path.resolve(__dirname, '../../index'))
});

var ensure = require('./ensure');

var exports = module.exports = {};

exports.session = function () {
  ensure.available('session');
  before(function () {
    this.session = new Session();
  });
};

