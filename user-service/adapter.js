const axios = require('axios');

function adapterGet (url, res, callback){
  axios.get(url)
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    res.sendStatus(500);
  });
};

module.exports = {
  adapterGet,
};
