var cli = require('cli');
var _ = require('underscore');
var AWS = require('aws-sdk');
var Table = require('cli-table');
var i = require('./package.json');
var fs = require('fs');
var path = require('path');

exports.myCli = function(options) {
  return {
    "s3": null,
    "init": function(option) {
      this.s3 = new AWS.S3({
        "region": option.region,
      });
    },
    "run": function(args) {
      cli.setApp("heimdall", i.version);
      var commands = [
        "Version: " + i.version,
        "",
        "Commands:",
        "  history PATH",
        "    Show a file history (all versions)",
        "  revision PATH",
        "    Get single file revision information",
        "  bifrost PATH",
        "    Download all revisions of a given file",
      ];
      cli.setUsage("heimdall COMMAND [OPTIONS] [ARGS]\n\n" + commands.join("\n"));

      var opts = {
        bucket: ['b', 'The bucket name', 'string', 'your.bucketname'],
        region: ['r', 'Your current region', 'string', 'eu-west-1'],
      };

      switch (args[0]) {
        case 'revision':
          _.extend(opts,{
            version: ["v", "The file version identification string", "string", false],
          });
          break;
        case 'bifrost':
          _.extend(opts,{
            path: ["p", "The base folder path", "string", __dirname],
          });
          break;
      }

      cli.parse(opts);

      var that = this;
      cli.main(function(args, options) {
        var command = that[args[0]];
        that.init(options);
        return (command) ? command.apply(that, [options, args.slice(1)]) : cli.getUsage();
      });
    },
    "revision": function(options, args) {
      var key = args[0];
      var params = {
        Bucket: options.bucket,
        Key: key,
      };
      if (options.version) {
        params.VersionId = options.version;
      }
      this.s3.getObject(params, function(err, data) {
        if (err) {
          cli.fatal(err.toString());
        }
        cli.output(data.Body.toString());
      });
    },
    "history": function(options, args) {
      var key = args[0];
      var params = {
        Bucket: options.bucket,
        Prefix: key,
      };
      var table = this.createTable(['#', 'Rev', 'Date', 'Path']);
      this.s3.listObjectVersions(params, function(err, data) {
        if (err) {
          cli.fatal(err.toString());
        }
        _.each(data.Versions, function(elem, index) {
          table.push([index, elem.VersionId, elem.LastModified.toString(), elem.Key]);
        });
        cli.output(table.toString());
      });
    },
    "bifrost": function(options, args) {
      var key = args[0];
      var that = this;
      var params = {
        Bucket: options.bucket,
        Prefix: key,
      };
      this.s3.listObjectVersions(params, function(err, data) {
        if (err) {
          cli.fatal(err.toString());
        }
        _.each(data.Versions, function(elem, index) {
          var params = {
            Bucket: options.bucket,
            Key: elem.Key,
            VersionId: elem.VersionId
          };
          that.s3.getObject(params, function(err, obj) {
            if (err) {
              cli.fatal(err.toString());
            }
            var filename = options.path + "/" + path.basename(elem.Key, path.extname(elem.Key)) + "." + index + "." + elem.VersionId + path.extname(elem.Key);
            cli.info(filename + " written");
            fs.writeFile(filename, obj.Body.toString());
          });
        });
      });
    },
    "createTable": function(cols) {
      return new Table({
        head: cols,
        chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '',
          'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '',
          'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': '',
          'right': '' , 'right-mid': '' , 'middle': ' ' },
      });
    }
  };
};
