var q = require('q');

module.exports = function(s3) {
  return {
    "get": function(filepath, options) {
      var defer = q.defer();

      var params = {
        Bucket: options.bucket,
        Key: filepath,
      };
      if (options.version) {
        params.VersionId = options.version;
      }
      s3.getObject(params, function(err, data) {
        if (err) {
          defer.reject(err);
        }
        defer.resolve(data);
      });

      return defer.promise;
    },
  };
};
