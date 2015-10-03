var config = require('../src/config');
var logger = require('../src/logger')(config);

var app = require('../app')(config, logger).callback();

var session = require('supertest-session');

describe('GET /api/codenames', function () {

  var testSession = null;

  beforeEach(() => {
    testSession = session(app);
  });

  describe('when no lists are specified', function () {
    it('receives bad request', function (done) {
      testSession.get('/api/codenames?filters=alliterative')
        .set('accept', 'application/json')
        .expect(400)
        .end(done);
    });
  });

  describe('when no filters are specified', function () {
    it('receives bad request', (done) => {
      testSession.get('/api/codenames?lists=crayons,cities')
        .set('accept', 'application/json')
        .expect(400)
        .end(done);
    });
  });

  describe('when all fields are provided', function () {
    it('receives bad request', (done) => {
      testSession.get('/api/codenames?lists=crayons,cities&filters=alliterative')
        .set('accept', 'application/json')
        .expect(200)
        .end(done);
    });
  });
});

describe('unknown routes', function () {

  var testSession = null;

  beforeEach(() => {
    testSession = session(app);
  });

  it('receives bad request', (done) => {
    testSession.get('/api/fhqwhgads')
      .set('accept', 'application/json')
      .expect(404)
      .end(done);
  });
});

