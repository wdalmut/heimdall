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
      require('./revision')(this.s3).get(args[0], options).then(function(data) {
        cli.output(data.Body.toString());
      }, function(err) {
        cli.fatal(err.toString());
      });
    },
    "history": function(options, args) {
      var that = this;
      require('./history')(this.s3).get(args[0], options).then(function(data) {
        var table = that.createTable(['#', 'Rev', 'Date', 'Path']);
        _.each(data.Versions, function(elem, index) {
          table.push([index, elem.VersionId, elem.LastModified.toString(), elem.Key]);
        });
        cli.output(table.toString());
      }, function(err) {
        cli.fatal(err.toString());
      });
    },
    "bifrost": function(options, args) {
      require('./bifrost')(this.s3).get(args[0], options).then(function(data) {
        _.each(data, function(elem) {
          cli.info("Downloaded file at: " + elem.filename);
        });
      }, function(err) {
        cli.fatal(err.toString());
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
