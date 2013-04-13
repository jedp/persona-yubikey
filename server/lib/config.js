const
fs = require('fs'),
path = require('path'),
GNOMN_CONFIG_FILE = path.join(__dirname, '../../../gnomn.conf.json');

function readSekret(name) {
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

    gnomn_public_key: readSekret('key.publickey'),
    gnomn_private_key: readSekret('key.secretkey'),
  }
}

config['port'] = parseInt(process.env.PORT || 3000, 10);
config['ip_address'] = process.env.IP_ADDRESS || '127.0.0.1';

module.exports = config;

