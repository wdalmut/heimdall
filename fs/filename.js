var path = require('path');

module.exports = function() {
  return {
    "renameUsingS3Revision": function(file) {
      var filename = file.path + "/" + path.basename(file.name, path.extname(file.name)) + "." + file.index + "." + file.VersionId + path.extname(file.name);

      return filename;
    },
  };
};
