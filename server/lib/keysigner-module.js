const jwcrypto = require('jwcrypto');

require('jwcrypto/lib/algs/rs');
require('jwcrypto/lib/algs/ds');

process.on('message', function(message) {
  var publicKey = jwcrypto.loadPublicKey(message.public_key);
  var secretKey = jwcrypto.loadSecretKey(message.secret_key);

  var now = new Date();
  var exp = new Date(now.valueOf() + message.duration * 1000);

  var principal = {email: message.email};

  var certParams = {
    publicKey: publicKey,
    principal: principal
  };

  var assertionParams = {
    issuer: message.hostname,
    issuedAt: now,
    expiresAt: exp
  };

  var additionalPayload = {};

  function callback(err, cert) {
    if (err) return process.send({success: false, reason: err});
    return process.send({success: true, certificate: cert});
  }

  jwcrypto.cert.sign(
      certParams, 
      assertionParams, 
      additionalPayload, 
      secretKey, 
      callback);
});
