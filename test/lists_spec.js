var config = require('../src/config');
var logger = require('../src/logger')(config);

var app = require('../app')(config, logger).callback();

var session = require('supertest-session');

describe('GET /api/lists', () => {

  var testSession = null;

  beforeEach(() => {
    testSession = session(app);
  });

  it('should serve a list of filters', (done) => {
    testSession.get('/api/filters')
      .set('accept', 'application/json')
      .expect(200)
      .expect(/alliterative/)
      .end(done);
  });

  it('should serve a list of wordlists', function (done) {
    testSession.get('/api/lists')
      .set('accept', 'application/json')
      .expect(200)
      .expect(/crayons/)
      .end(done);
  });

});


