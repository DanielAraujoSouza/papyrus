const axios = require('axios');

function adapterGet (url, res, callback){
  axios.get(url)
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    console.log(err)
    res.sendStatus(502);
  });
};

module.exports = {
  adapterGet,
};
