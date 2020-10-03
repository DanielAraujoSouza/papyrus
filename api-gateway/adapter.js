const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

function adapterGet (url, user, res, callback){
  // Faz uma requisição a outro microserviço com token de autenticação
  axios.get(url, { 
    headers: {
      "Authorization" : generateJWT(user)
    }
  })
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    res.redirect('/');
  });
};

function adapterPost(url, user, res, data, callback){
  
  axios.post(url, data, { 
    headers: {
      "Authorization" : generateJWT(user)
    }
  })
  .then(resp => {
    callback(res, resp);
  })
  .catch(err => {
    res.redirect('/');
  });
};

function generateJWT (user) {

  // Gera o token com a chave assimetrica
  const userID = user ? user._id : null;
  const privateKey  = fs.readFileSync(`${__dirname}/authentication/private.key`, 'utf8');
  const token = jwt.sign({ id: userID}, privateKey, { 
    expiresIn: 30,
    algorithm:  "RS256"
  });

  return token;
}

module.exports = {
  adapterGet,
  adapterPost 
};
