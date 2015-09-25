var config = require('../src/config');
var logger = require('../src/logger')(config);

var Session = require('supertest-session')({
  app: require('../app')(config, logger).callback()
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


