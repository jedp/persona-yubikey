const 
Hapi = require('hapi'),
config = require('./config'),
yubikey = require('yubikey');


var options = {
  views: {
    path: __dirname + '/templates',
    engine: {
      module: 'jade',
      extension: 'jade'
    },
    compileOptions: {
      pretty: true
    }
  }
};

var server = Hapi.createServer(config.port, options);

var rootHandler = function(req) {
  req.reply.view('index', {message: "I like pie"}).send();
};

server.route({
  method: 'GET',
  path: '/',
  handler: rootHandler
});

module.exports = server;

if (!module.parent) {
  server.start();
}


