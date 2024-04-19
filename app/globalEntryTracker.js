const helpers = require('./helpers');
const utils = require('./utils');
const execSync = require('child_process').execSync;
const fs = require('fs');

let args = require('minimist')(process.argv.slice(2));
let schedule = args.schedule === "true" ? true : false;
let upto = args.upto !== null ? parseInt(args.upto) : -1;
let untilSlotDate = (upto !== -1) ? utils.m.createMoment().add(upto, 'days') : null;

let NOTIFICATION_TYPES = {
  'SMS': 'SMS',
  'EMAIL': 'EMAIL',
  'POPUP_ALERT': 'POPUP_ALERT'
};
let LOCATIONS_MAP = [];
let count = 1;

function loadAllLocations(callback) {
  let filepath = 'docs/all_locations.json';
  fs.readFile(filepath, function (err, data) {
    if (err) {
      return callback(err);
    }
    try {
      let locations = JSON.parse(data);
      LOCATIONS_MAP = utils._.keyBy(locations, 'id');
    } catch (err) {
      return callback(err);
    }

    return callback(null);
  });
}

function getFromLocation(locationId, callback) {
  let url = `${utils.config.ttpUrl}?orderBy=soonest&limit=1&minimum=1&locationId=${locationId}`;
  helpers.requests.get(url, undefined, callback);
}

function getNotificationText(notifyObj) {
  return `Global Entry slot available! '${notifyObj.location.name}'on ${notifyObj.dateStr} at ${notifyObj.timeStr}`;
}

function sendSMS(notifyObj, callback) {
  let options = {
    from: utils.config.sms.from,
    to: utils.config.sms.to,
    body: getNotificationText(notifyObj)
  };

  helpers.notify.sendSMS(options, function (err) {
    return callback(err);
  });
}

function sendEmail(notifyObj, callback) {
  let text = getNotificationText(notifyObj);
  let options = {
    from: utils.config.email.from,
    to: utils.config.email.to,
    subject: text,
    text: text
  };

  helpers.notify.sendEmail(options, function (err) {
    return callback(err);
  });
}

function popupAlert(notifyObj, callback) {
  let soundCmd = 'osascript -e beep';
  let musicFile = utils.config.musicFile || null;
  if (musicFile) {
    soundCmd = `afplay ${musicFile}`;
  }
  execSync(soundCmd);

  let popupCmd = `osascript -e 'tell app "System Events" to display dialog "${notifyObj.dateStr} at ${notifyObj.timeStr}" with title "Global Entry Slot Available" buttons "OK"'`;
  execSync(popupCmd);

  return callback(null);
}

function notify(data, notificationType, callback) {
  if (utils._.isEmpty(data)) {
    return callback(null);
  }

  if (NOTIFICATION_TYPES[notificationType] === null) {
    return callback(`Invalid notification type, ${notificationType}`);
  }

  let availableSlot = utils._.first(data);
  let location = LOCATIONS_MAP[availableSlot.locationId];
  availableSlot.location = location;
  let slotDateTime = utils.m.createMoment(availableSlot.startTimestamp, location.tzData);
  availableSlot.dateTime = slotDateTime;
  availableSlot.dateStr = slotDateTime.format('MMM DD, YYYY');
  availableSlot.timeStr = slotDateTime.format('hh:mm A');

  if (untilSlotDate !== null && slotDateTime.isAfter(untilSlotDate)) {
    console.log(`Available slot date: ${slotDateTime.format()} is more than ${upto} day(s) from now, ignore!`);
    return callback(null);
  }

  switch (notificationType) {
    case NOTIFICATION_TYPES.EMAIL:
      return sendEmail(availableSlot, callback);
      break;
    case NOTIFICATION_TYPES.SMS:
      return sendSMS(availableSlot, callback);
      break;
    case NOTIFICATION_TYPES.POPUP_ALERT:
      return popupAlert(availableSlot, callback);
      break
    default:
      return callback(`Error! Invalid notification type ${notificationType}`);
      break;
  };
}

function performTask(callback) {
  utils.async.waterfall(
    [
      function (next) {
        loadAllLocations(next);
      },
      function (next) {
        console.log(`Checking for available slots [${LOCATIONS_MAP[utils.config.locationId].name}], # ${count++} [${new Date().toLocaleTimeString()}]`);
        getFromLocation(utils.config.locationId, next);
      },
      function (data, next) {
        console.log('', data);
        notify(data, NOTIFICATION_TYPES[utils.config.alertType], next);
      },
      function (next) {
        console.log('DONE!');
        return next(null);
      }
    ],
    callback
  );
}

if (schedule) {
  console.log(`perform task, schedule every ${utils.config.scheduleInMinutes} minute(s)`);
  if (untilSlotDate !== null) {
    console.log(`Looking for slot dates in the next ${upto} day(s), before`, untilSlotDate.format());
  }
  setInterval(
    function () {
      performTask(function () {});
    },
    utils.config.scheduleInSeconds * 1000
  );
} else {
  console.log('perform task, run-once');
  performTask(function() {});
}
