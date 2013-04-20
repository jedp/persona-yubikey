const
Hapi = require('hapi'),
config = require('./config'),
utils = require('./utils'),
certify = require('./certify'),
foo = require('yar'),
Yubikey = require('yubikey'),
yubikey = new Yubikey(config.yubikeyClientId, config.yubikeySecretKey);

// Create server

var serverOptions = {
  debug: {request: ['error', 'uncaught'] },
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

var server = new Hapi.Server(config.ip_address, config.port, serverOptions);

// Add session support

var sessionOptions = {
  cookieOptions: {
    password: config.sessionKey
  }
};

var yar = __dirname + '/../../node_modules/yar';
server.plugin.allow({ext: true}).require(yar, sessionOptions, function (err) { 
  if (err) {
    console.error(err);
  }
});

// Serve the home page
var getRoot = function() {
  this.reply.view('index').send();
};

// Serve browserid support manifest
var getWellknown = function() {
  this.reply({
    'public-key': config.publicKey_json,
    'authentication': '/sign_in',
    'provisioning': '/provision'
  });
};

// Is the identity of the Yubikey already authenticated?
var getIdentityIsAuthenticated = function() {
  if (!this.query.identity) return this.reply({success: false, reason: 'Missing parameters'});
  var identity = this.query.identity.trim();
  var state = this.session.get('state');
  if (state && state.authenticated && identity === state.identity) {
    return this.reply({success: true});
  }
  return this.reply({success: false, reason: 'Not authenticated'});
};

// Submit an OTP for verification
var postOtpForVerification = function() {
  var otp = this.payload.otp.trim();
  if (otp.length !== 44) return this.reply({success: false, reason: 'Bad OTP'});

  yubikey.verify(otp, function(err, success) {
    if (err) {
      console.log('yubikey.verify error:', err);
      return this.reply({success: false, reason: err.toString()});
    }
    if (!success) return this.reply({success: false, reason: 'Success was ' + success});
    this.session.set('state', {
      authenticated: true,
      identity: otp.slice(0, 12)
    });
    return this.reply({success: true});
  }.bind(this));
};

// Certify a public key
var postCertKey = function() {
  var params = {
    duration: utils.ensureInt(this.payload.duration || config.certDuration_ms),
    pubkey: this.payload.publicKey,
    email: this.payload.email,
    hostname: config.hostname
  };
  if (!(params.duration && params.pubkey && params.email)) {
    return this.reply({success: false, reason: 'Missing parameters'});
  }
  certify(params, function(err, certificate) {
    if (err) {
      console.log('postCertKey error:', err);
      return this.reply({success: false, reason: err.toString()});
    } else {
      return this.reply({success: true, certificate: certificate});
    }
  }.bind(this));
};

// Serve the authentication page
var getAuth = function() {
  this.reply.view('authenticate').send();
};

// Serve the provisioning page
var getProv = function() {
  this.reply.view('provision').send();
};

// Serve static js or css
var getStatic = function(path) {
  if (! path.match(/(css|js)/)) return this.reply({success: false});
  return {directory: {
    path: __dirname + '/public/' + path,
    listing: false,
    index: false
  }}
};

var routes = [
  ['GET',  '/',                       getRoot],
  ['GET',  '/.well-known/browserid',  getWellknown],
  ['GET',  '/sign_in',                getAuth],
  ['GET',  '/provision',              getProv],
  ['GET',  '/identity',               getIdentityIsAuthenticated],
  ['GET',  '/js/{path*}',             getStatic('js')],
  ['GET',  '/css/{path*}',            getStatic('css')],

  ['POST', '/otp',                    postOtpForVerification],
  ['POST', '/cert_key',               postCertKey]
];

routes.forEach(function(tuple) {
  server.route({method: tuple[0], path: tuple[1], handler: tuple[2]});
});

module.exports = server;

if (!module.parent) {
  console.log('starting server');
  server.start();
}

