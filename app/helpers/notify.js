const nodemailer = require('nodemailer');
const requests = require("./requests");
const utils = require('../utils');

const SINCH_API_KEY = utils.config.sms.sinch.apiKey;
const SINCH_API_SECRET = utils.config.sms.sinch.apiSecret;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: utils.config.email.auth.user,
    pass: utils.config.email.auth.pass
  }
});

function sendEmail(options, callback) {
  let emailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text
  };

  transporter.sendMail(emailOptions, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
}

function sendSMS(options, callback) {
  let url = `https://sms.api.sinch.com/xms/v1/${SINCH_API_KEY}/batches`;

  let headers = {
    'Authorization': `Bearer ${SINCH_API_SECRET}`,
    'Content-Type': 'application/json'
  };

  let body = {
    from: options.from,
    to: [options.to],
    body: options.body
  };

  requests.post(url, headers, body, callback);
}

module.exports = {
  sendEmail,
  sendSMS
}