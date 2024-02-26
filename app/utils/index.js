const path = require('path');

function loadConfigs() {
  let configFilePath = path.normalize(`${process.cwd()}/config/config.js`);
  let configs = require(configFilePath);
  return configs;
}

module.exports = {
  _: require('lodash'),
  async: require('async'),
  m: require('./moment'),
  config: loadConfigs()
}