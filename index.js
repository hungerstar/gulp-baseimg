var fs = require('fs');
var path = require('path');
var imgParser = require('imagesize').Parser;
var mustache = require('mustache');
var through = require('through');
var gutil = require('gulp-util');
var mime = require('mime');

module.exports = function(opts) {
  var tpl = fs.readFileSync(opts.styleTemplate).toString();
  var buffer = [];
  var parser = new imgParser();

  var bufferContents = function(file) {
    var imgData;
    if(parser.parse(file.contents) === imgParser.DONE) {
      imgData = parser.getResult();
      imgData.data = 'url(data:' + mime.lookup(imgData.format) + ';base64,' + file.contents.toString('base64') + ')';
      imgData.name = path.basename(file.path, '.' + imgData.format);
      buffer.push(imgData);
    }
  };

  var endStream = function() {
    this.emit('data', new gutil.File({
      contents: new Buffer(mustache.render(tpl, {
        items: buffer
      }))
    }));
  };

  return new through(bufferContents, endStream);
};
