var _ = require('lodash');

var errors = {
  badRequest: [400, 'Bad Request'],
  notFound:   [404, 'Not Found'],
  internal:   [500, 'Internal Server Error']
};

function errorFactory (info, name) {
  return [name, function (message) {
    var err = new Error(message || info[1]);
    return _.extend(err, {
      name: name,
      status: info[0]
    });
  }];
}

module.exports = _.object(_.map(errors, errorFactory));

