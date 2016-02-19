var fs = require('./filename');

describe("Rename a given file using the S3 revision history", function() {
  it("Rename a file using S3 revision", function() {
    obj = {
      path: "/tmp",
      index: 0,
      VersionId: "revision",
      name: "example.txt",
    };
    var filename = fs().renameUsingS3Revision(obj);

    expect(filename).toEqual("/tmp/example.0.revision.txt", filename);
  });
});
