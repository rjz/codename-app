var exports = module.exports;

exports.yieldBadRequest = function (method, route) {
  it('should return a bad request', function (done) {
    this.session.request(method, route)
      .expect(400)
      .end(done);
  });
};

exports.yieldOk = function (method, route) {
  it('should return ok', function (done) {
    this.session.request(method, route)
      .expect(200)
      .end(done);
  });
};

exports.yieldNotFound = function (method, route) {
  it('should return ok', function (done) {
    this.session.request(method, route)
      .expect(404)
      .end(done);
  });
};

