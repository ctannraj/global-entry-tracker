const axios = require('axios');

function get(url, headers, callback) {
  axios.get(
    url,
    {
      headers: headers
    }
  )
    .then(response => {
      return callback(null, response.data);
    })
    .catch(err => {
      return callback(err);
    });
}

function post(url, headers, body, callback) {
  axios.post(
    url,
    body,
    {
      headers: headers
    }
  )
    .then(response => {
      return callback(null, response.data);
    })
    .catch(err => {
      return callback(err);
    });
}

module.exports = {
  get,
  post
}