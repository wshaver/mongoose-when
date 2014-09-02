var mongoose = require('mongoose');
var Promise = mongoose.Promise;
var core_slice = Array.prototype.slice;

/*
* Based on jquery's when implementation, with changes to fit mongoose's promise-a style.
* http://api.jquery.com/jQuery.when/
*/

Promise.when = function(subordinate /* , ..., subordinateN */ ) {
  var i = 0,
    resolveValues = core_slice.call(arguments),
    length = resolveValues.length,

    // the count of uncompleted subordinates
    remaining = length !== 1 || (subordinate && 'function' == typeof subordinate.then) ? length : 0,

    // the master Promise. If resolveValues consist of only a single Promise, just use that.
    promise = remaining === 1 ? subordinate : new Promise(),

    // Update function for both resolve and progress values
    updateFunc = function(i, values) {
      return function(value) {
        values[i] = arguments.length > 1 ? core_slice.call(arguments) : value;
        if (!(--remaining)) {
          promise.fulfill.apply(promise, values);
        }
      };
    },

    progressValues;

  // add listeners to promise subordinates; treat others as resolved
  if (length > 1) {
    progressValues = new Array(length);
    for (; i < length; i++) {
      if (resolveValues[i] && 'function' == typeof resolveValues[i].then) {
        resolveValues[i]
          .onFulfill(updateFunc(i, resolveValues))
          .onReject(promise.reject.bind(promise));
      } else {
        --remaining;
      }
    }
  }

  // if we're not waiting on anything, resolve the master
  if (!remaining) {
    promise.fulfill(resolveValues);
  }

  return promise;
};

module.exports = exports = {};
Promise.when.version = exports.version = require('../package').version;
