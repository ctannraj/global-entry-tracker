const path = require('path');

function updateScheduleInSeconds(configs) {
  let value = 60;
  try {
    let _value = eval(configs.scheduleInSeconds);
    if (_value > 60) {
      value = _value;
    }
  } catch (err) {
  }
  configs.scheduleInSeconds = value;
  configs.scheduleInMinutes = Math.ceil(value / 60);
}

function loadConfigs() {
  let configFilePath = path.normalize(`${process.cwd()}/config/config.js`);
  let configs = require(configFilePath);
  updateScheduleInSeconds(configs);
  return configs;
}

module.exports = {
  _: require('lodash'),
  async: require('async'),
  m: require('./moment'),
  config: loadConfigs()
}
