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

function adapterPut(url, user, res, data, callback){
  
  axios.put(url, data)
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    res.sendStatus(502);
  });
};

module.exports = {
  adapterGet,
  adapterPut,
};
