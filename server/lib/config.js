const
fs = require('fs'),
path = require('path'),
jwcrypto = require('jwcrypto'),
GNOMN_CONFIG_FILE = path.join(__dirname, '../../../gnomn.conf.json');

require('jwcrypto/lib/algs/rs');
require('jwcrypto/lib/algs/ds');

function readSekret(name) {
  var filepath = path.join(__dirname, '../../sekret', name);
  return JSON.parse(fs.readFileSync(filepath).toString());
}

var config;
if (fs.existsSync(GNOMN_CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(GNOMN_CONFIG_FILE));
} else {
  var crypto = require('crypto');

  yubikey_creds = readSekret('yubikey');
  config = {
    yubikeyClientId: yubikey_creds.id,
    yubikeySecretKey: yubikey_creds.key,

    publicKey: readSekret('key.publickey'),
    secretKey: readSekret('key.secretkey'),

    sessionKey: crypto.createHash('sha1').update(crypto.randomBytes(2048)).digest('hex'),

    hostname: 'localhost'
  }
}

// At this point, public and secret keys have been read from JSON.
// Now convert them into jwcrypto objects for use by our certifier.
// Keep a copy of the json public key for publishing in well-known.
config.publicKey_json = config.publicKey;
config.publicKey = jwcrypto.loadPublicKeyFromObject(config.publicKey);
config.secretKey = jwcrypto.loadSecretKeyFromObject(config.secretKey);

// awsbox sets PORT and IP_ADDRESS in the env.
config.port = parseInt(process.env.PORT || 3000, 10);
config.ip_address = process.env.IP_ADDRESS || '127.0.0.1';

// compute cluster for certificate signing
config.max_processes = process.env.COMPUTE_CLUSTER_PROCESSES || 20;

module.exports = config;

