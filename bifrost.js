var q = require('q');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var revision = require('./revision');
var history = require('./history');

module.exports = function(s3) {
  return {
    "get": function(filepath, options) {
      var defer = q.defer();

      var that = this;
      var params = {
        Bucket: options.bucket,
        Prefix: filepath,
      };

      history(s3).get(filepath, options).then(function(data) {
        var promises = [];
        _.each(data.Versions, function(elem, index) {
          promises.push(revision(s3).get(filepath, {
            "bucket": options.bucket,
            "Key": filepath,
            "VersionId": elem.VersionId,
          }));
        });

        return q.all(promises);
      }, function(err) {
        defer.reject(err);
      }).then(function(datas) {
        var filePromises = [];
        _.each(datas, function(obj, index) {
          var filename = require('./fs/filename')().renameUsingS3Revision(_.extend(
            options,
            {"name": filepath, "index": index},
            obj
          ));

          filePromises.push(
            require('./dump')(fs)
              .dump(filename, obj.Body.toString())
          );
        });

        return q.all(filePromises);
      }, function(err) {
        defer.reject(err);
      }).then(function (filelist) {
        defer.resolve(filelist);
      }, function(err, filename) {
        defer.reject(err);
      });

      return defer.promise;
    },
  };
};
