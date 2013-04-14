const
Hapi = require('hapi'),
config = require('./config'),
utils = require('./utils'),
Yubikey = require('yubikey'),
yubikey = new Yubikey(config.yubikey_client_id, config.yubikey_secret_key);

var serverOptions = {
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

var server = new Hapi.Server(config.ip_addr, config.port, serverOptions);

// Serve the home page
var rootHandler = function(req) {
  req.reply.view('index', {message: "I like pie"}).send();
};

// Serve browserid support manifest
var getWellknown = function(req) {
  req.reply({
    'public-key': config.gnomn_public_key,
    'authentication': '/sign_in',
    'provisioning': '/provision'
  });
};

// Is the identity of the Yubikey already authenticated?
var getIdentityIsAuthenticated = function(req) {
  if (!req.query.identity) return req.reply({success: false});
  var identity = req.query.identity.trim();
  console.log("received identity:", identity);
  if (req.state.authenticated && identity === req.state.identity) {
    return req.reply({success: true});
  }
  return req.reply({success: false});
};

// Submit an OTP for verification
var postOtpForVerification = function(req) {
  var otp = req.payload.otp.trim();
  console.log("received otp:", otp, otp.length, "chars");
  if (otp.length !== 44) return req.reply({success: false});

  yubikey.verify(otp, function(err, success) {
    if (err) return req.reply({success: false, err: err});
    req.state.authenticated = true;
    req.state.identity = otp.slice(0, 14);
    return req.reply({success: success});
  });
};

// Certify a public key
var postCertKey = function(req) {
  var params = {
    duration: utils.ensureInt(req.payload.duration || config.cert_duration_ms),
    pubkey: req.payload.pubkey,
    email: req.payload.email,
    hostname: config.hostname
  };
  if (!(params.duration && params.pubkey && params.email)) {
    return req.reply({success: false});
  }
  utils.certify(params, function(err, cert) {
    return req.reply({
      success: (!err && cert),
      certificate: (!err && cert) ? cert : null,
      reason: err ? err.toString : null
    });
  });
};

// Serve the authentication page
var getAuth = function(req) {
  req.reply.view('authenticate').send();
};

// Serve the provisioning page
var getProv = function(req) {
  req.reply.view('provision').send();
};

// Serve static js or css
var getStatic = function(path) {
  if (! path.match(/(css|js)/)) return req.reply({success: false});
  return {directory: {
    path: __dirname + '/public/' + path,
    listing: false,
    index: false
  }}
};

server.route({path: '/', method: 'GET', handler: rootHandler});
server.route({path: '/.well-known/browserid', method: 'GET', handler: getWellknown});
server.route({path: '/sign_in', method: 'GET', handler: getAuth});
server.route({path: '/cert_key', method: 'POSt', handler: postCertKey});
server.route({path: '/provision', method: 'GET', handler: getProv});
server.route({path: '/identity', method: 'GET', handler: getIdentityIsAuthenticated});
server.route({path: '/otp', method: 'POST', handler: postOtpForVerification});
server.route({path: '/js/{path*}', method: 'GET', handler: getStatic('js')});
server.route({path: '/css/{path*}', method: 'GET', handler: getStatic('css')});

module.exports = server;

if (!module.parent) {
  server.start();
}

