const
Cluster = require('compute-cluster'),
path = require('path'),
config = require('./config');

var cluster = new Cluster({
  max_processes: config.max_processes
  module: path.join(__dirname, 'keysigner-module.js');
});

cluster.on('error', function(err) {
  process.nextTick(function() {
    process.exit(1);
  });
});

module.exports = function(params, callback) {
  params.secret_key = config.secret_key.serialize();
  cluster.enqueue(params, function(err, result) {
    if (err) return callback(err);
    if (!result.success) return callback(result.reason);
    return callback(null, result.certificate);
  });
};

