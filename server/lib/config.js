const
fs = require('fs'),
path = require('path'),
jwcrypto = require('jwcrypto'),
GNOMN_CONFIG_FILE = path.join(__dirname, '../../../gnomn.conf.json');

require('jwcrypto/lib/algs/rs');
require('jwcrypto/lib/algs/ds');

function readSekret(name) {
  console.log("reading", name);
  var filepath = path.join(__dirname, '../../sekret', name);
  return JSON.parse(fs.readFileSync(filepath).toString());
}

var config;
if (fs.existsSync(GNOMN_CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(GNOMN_CONFIG_FILE));
} else {
  yubikey_creds = readSekret('yubikey');
  config = {
    yubikey_client_id: yubikey_creds.id,
    yubikey_secret_key: yubikey_creds.key,

    public_key: readSekret('key.publickey'),
    secret_key: readSekret('key.secretkey')
  }
}

// At this point, public and secret keys have been read from JSON.
// Now convert them into jwcrypto objects for use by our certifier.
config.public_key = jwcrypto.loadPublicKeyFromObject(config.public_key);
config.secret_key = jwcrypto.loadSecretKeyFromObject(config.secret_key);

// awsbox sets PORT and IP_ADDRESS in the env.
config.port = parseInt(process.env.PORT || 3000, 10);
config.ip_address = process.env.IP_ADDRESS || '127.0.0.1';

// compute cluster for certificate signing
config.max_processes = process.env.COMPUTE_CLUSTER_PROCESSES || 20;

module.exports = config;

