var q = require('q');

module.exports = function(fs) {
  return {
    "dump": function(filename, body) {
      var defer = q.defer();

      fs.writeFile(filename, body, function(err) {
        if (err) {
          return defer.reject(err, filename);
        }

        defer.resolve({"filename": filename});
      });

      return defer.promise;
    },
  };
};
