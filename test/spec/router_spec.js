var path = require('path');

var given = require(path.resolve(__dirname, '../helpers/given')),
    should = require(path.resolve(__dirname, '../helpers/should'));

describe('API Routing', function () {

  given.session();

  it('should serve a list of filters', function (done) {
    this.session.get('/api/filters')
      .expect(200)
      .expect(/alliterative/)
      .end(done);
  });

  it('should serve a list of wordlists', function (done) {
    this.session.get('/api/lists')
      .expect(200)
      .expect(/crayons/)
      .end(done);
  });

  describe('codenames', function () {
    describe('when no lists are specified', function () {
      should.yieldBadRequest('get', '/api/codenames?filters=alliterative');
    });

    describe('when no filters are specified', function () {
      should.yieldBadRequest('get', '/api/codenames?lists=crayons,cities');
    });

    describe('when all fields are provided', function () {
      should.yieldOk('get', '/api/codenames?lists=crayons,cities&filters=alliterative');
    });
  });

  describe('unknown routes', function () {
    should.yieldNotFound('get', '/api/fhqwhgads');
  });
});

