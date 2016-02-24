var cli = require('cli');
var _ = require('underscore');
var AWS = require('aws-sdk');
var Table = require('cli-table');
var i = require('./package.json');
var fs = require('fs');
var path = require('path');
var Cli = require('wcli');

exports.myCli = function(options) {
  return {
    "s3": null,
    "init": function(option) {
      this.s3 = new AWS.S3({
        "region": option.region,
      });
    },
    "run": function(args) {
      var that = this;
      cli = new Cli({
        "history": {
          bucket: ['b', 'The bucket name', 'your.bucketname'],
          region: ['r', 'Your current region', 'eu-west-1'],
        },
        "revision": {
          bucket: ['b', 'The bucket name', 'your.bucketname'],
          region: ['r', 'Your current region', 'eu-west-1'],
          version: ["v", "The file version identification string", ''],
        },
        "bifrost": {
          bucket: ['b', 'The bucket name', 'your.bucketname'],
          region: ['r', 'Your current region', 'eu-west-1'],
          path: ["p", "The base folder path", __dirname],
        },
      });
      cli.app = "heimdall-s3";

      cli.revision = function(options, args) {
        that.init(options);
        require('./revision')(that.s3).get(args[0], options).then(function(data) {
          cli.info(data.Body.toString());
        }, function(err) {
          cli.fatal(err.toString());
        });
      };
      cli.history = function(options, args) {
        that.init(options);
        require('./history')(that.s3).get(args[0], options).then(function(data) {
          var table = that.createTable(['#', 'Rev', 'Date', 'Path']);
          _.each(data.Versions, function(elem, index) {
            table.push([index, elem.VersionId, elem.LastModified.toString(), elem.Key]);
          });
          cli.info(table.toString());
        }, function(err) {
          cli.fatal(err.toString());
        });
      };
      cli.bifrost = function(options, args) {
        that.init(options);
        require('./bifrost')(that.s3).get(args[0], options).then(function(data) {
          _.each(data, function(elem) {
            cli.info("Downloaded file at: " + elem.filename);
          });
        }, function(err) {
          cli.fatal(err.toString());
        });
      };
      cli.parse(args);
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
