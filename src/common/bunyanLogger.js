/**
 * Created by lenovo on 2016/3/30.
 */
const bunyan = require('bunyan');

const safeCycles = bunyan.safeCycles;

function SpecificLevelStream(levels, stream) {
  var self = this;
  this.levels = {};
  levels.forEach(function (lvl) {
    self.levels[bunyan.resolveLevel(lvl)] = true;
  });
  this.stream = stream;
}
SpecificLevelStream.prototype.write = function (rec) {
  if (this.levels[rec.level] !== undefined) {
    var str;
    if(process.env.NODE_ENV === 'production') {
      str = JSON.stringify(rec, safeCycles()) + '\n';
    }
    else {
      str = JSON.stringify(rec, safeCycles(), 2) + '\n';
    }
    this.stream.write(str);
  }
};

const infoStream = process.env.NODE_ENV === 'production'? new SpecificLevelStream(['info'], { path: 'logs/info.log' }): new SpecificLevelStream(['info'], process.stdout);
const errorStream = process.env.NODE_ENV === 'production'? new SpecificLevelStream(['error'], { path: 'logs/error.log' }): new SpecificLevelStream(['error'], process.stderr);

module.exports = bunyan.createLogger({
  name: 'backend-boilerplate',
  streams: [
    {
      type: 'raw',
      level: 'info',
      stream: infoStream,
    },
    {
      level: 'error',
      stream: errorStream,
      type: 'raw'
    },
  ],
  serializers: {
    err: bunyan.stdSerializers.err,
    req: function reqSerializer(req) {
      return {method: req.method, url: req.url, headers: req.headers, query: req.query, body: req.body};
    }
  }
});
