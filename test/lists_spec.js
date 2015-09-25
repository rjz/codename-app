var config = require('../src/config');
var logger = require('../src/logger')(config);

var Session = require('supertest-session')({
  app: require('../app')(config, logger).callback()
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


