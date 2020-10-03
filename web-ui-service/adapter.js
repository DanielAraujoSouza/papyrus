const axios = require('axios');
const fs = require('fs');

function adapterGet (url, res, callback){
  // Faz uma requisição a outro microserviço com token de autenticação 
  axios.get(url)
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    if (!err.response) {
      res.sendStatus(500);
    }
    else {
      res.sendStatus(err.response.status || 500);
    }
    
  });
};

function adapterPost(url, res, data, callback){
  axios.post(url, data)
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    res.sendStatus(err.response.status || 500);
  });
};

module.exports = {
  adapterGet,
  adapterPost 
};
