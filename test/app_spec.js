var config = require('../src/config');
var logger = require('../src/logger')(config);

var Session = require('supertest-session')({
  app: require('../app')(config, logger)
});

describe('GET /api/filters', () => {

  var session = null;

  beforeEach(() => {
    session = new Session();
  });

  it('should serve a list of filters', (done) => {
    session.get('/api/filters')
      .set('accept', 'application/json')
      .expect(200)
      .expect(/alliterative/)
      .end(done);
  });
});

describe('GET /api/lists', () => {

  var session = null;

  beforeEach(() => {
    session = new Session();
  });

  it('should serve a list of filters', (done) => {
    session.get('/api/filters')
      .set('accept', 'application/json')
      .expect(200)
      .expect(/alliterative/)
      .end(done);
  });

  it('should serve a list of wordlists', function (done) {
    session.get('/api/lists')
      .set('accept', 'application/json')
      .expect(200)
      .expect(/crayons/)
      .end(done);
  });

});

describe('GET /api/codenames', function () {

  var session = null;

  beforeEach(() => {
    session = new Session();
  });

  describe('when no lists are specified', function () {
    it('receives bad request', function (done) {
      session.get('/api/codenames?filters=alliterative')
        .set('accept', 'application/json')
        .expect(400)
        .end(done);
    });
  });

  describe('when no filters are specified', function () {
    it('receives bad request', (done) => {
      session.get('/api/codenames?lists=crayons,cities')
        .set('accept', 'application/json')
        .expect(400)
        .end(done);
    });
  });

  describe('when all fields are provided', function () {
    it('receives bad request', (done) => {
      session.get('/api/codenames?lists=crayons,cities&filters=alliterative')
        .set('accept', 'application/json')
        .expect(200)
        .end(done);
    });
  });
});

describe('unknown routes', function () {

  var session = null;

  beforeEach(() => {
    session = new Session();
  });

  it('receives bad request', (done) => {
    session.get('/api/fhqwhgads')
      .set('accept', 'application/json')
      .expect(404)
      .end(done);
  });
});

