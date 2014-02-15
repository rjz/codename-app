var exports = module.exports = {};

var _slice = Array.prototype.slice;

// Ensure a given variable exists in the context
exports.presenceOf = function () {
  var args = _slice(arguments);
  before(function () {
    args.forEach(function (k) {
      if (!this[k]) throw new Error(k + ' is not present');
    }.bind(this));
  });
};

// Ensure a given variable does not exist in the context
exports.absenceOf = function () {
  var args = _slice(arguments);
  before(function () {
    args.forEach(function (k) {
      if (this[k]) throw new Error(k + ' is present');
    }.bind(this));
  });
};

