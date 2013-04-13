#!/usr/bin/env node

const 
util = require('util'),
fs = require('fs'),
temp = require('temp'),
child_process = require('child_process'),
CONFIG_FILE = 'gnomn.conf.json';

function scp(src, dest, callback) {
  var cmd = 'scp -o "StrictHostKeyChecking no" ' + src + ' ' + dest;
  var proc = child_process.exec(cmd, function scpCallback(err, code) {
    if (err) return callback(err);
    if (code) return callback(new Error("scp error: code " + code));
    console.log("success.  scp is happy.");
    return callback(null, 0);
  });

  proc.stdout.on('data', function(data) {
    util.print('scp: ' + data.toString());
  });

  proc.stderr.on('data', function(data) {
    util.print('scp: ' + data.toString());
  });
}

function getenv(key) {
  var value = process.env[key];
  if (typeof value === 'undefined') {
    throw new Error(key + ' must be defined in your env');
  }
  return value;
}

function copyConfig(callback) {
  temp.open({}, function(err, tempfile) {
    if (err) throw err;

    var config = {
      // Our keys for signing certificates
      gnomn_public_key: JSON.parse(fs.readFileSync(path.join(__dirname, '../../sekret/key.publickey'))),
      gnomn_private_key: JSON.parse(fs.readFileSync(path.join(__dirname, '../../sekret/key.secretkey'))),

      // Yubico client api keys
      yubico_client_id: getenv('YUBICO_CLIENT_ID'),
      yubico_secret_key: getenv('YUBICO_SECRET_KEY')
    };

    fs.writeFileSync(tempfile.path, JSON.stringify(config), 'utf8');
    var dest = 'app@'+getenv('AWS_IP_ADDRESS')+':'+CONFIG_FILE

    console.log("Copying config");
    scp(tempfile.path, dest, callback);
  });
}

copyConfig(function(err, status) {
  if (err) throw err;

  process.exit(status);
});

