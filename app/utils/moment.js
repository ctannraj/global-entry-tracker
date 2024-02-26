const moment = require('moment-timezone');

function isInvalidOrBlank(value) {
  return value === null || value === undefined || value === '';
}

function createMoment(datetimeInput, timezone) {
  if (isInvalidOrBlank(timezone)) {
    return moment.tz("America/Los_Angeles");
  }
  return moment.tz(datetimeInput, timezone);
}

function toYYYYMMDD(timeInput) {
  return createMoment(timeInput).format("YYYY-MM-DD");
}

function toHHmm(timeInput) {
  return createMoment(timeInput).format("HH:mm");
}

module.exports = {
  createMoment,
  toYYYYMMDD,
  toHHmm
}