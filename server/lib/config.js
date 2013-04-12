const
fs = require('fs'),
path = require('path'),
GNOMN_CONFIG_FILE = path.join(__dirname, '../../gnomn.conf.json');

function readSekret(name) {
  var filepath = path.join(__dirname, '../../sekret', name);
  return fs.readFileSync(filepath).toString();
}

var config;
if (path.exists(GNOMN_CONFIG_FILE)) {
  config = JSON.parse(fs.readFileSync(GNOMN_CONFIG_FILE));
} else {
  config = {
    gnomn_public_key: readSekret('public-key.pem'),
    gnomn_private_key: readSekret('private-key.pem'),

    yubico_client_id: process.env['YUBICO_CLIENT_ID'],
    yubico_secret_key: process.env['YUBICO_SECRET_KEY']
  }
}

config['port'] = process.env.PORT || 3000;
config['ip_address'] = process.env.IP_ADDRESS || '127.0.0.1';

module.exports = config;

