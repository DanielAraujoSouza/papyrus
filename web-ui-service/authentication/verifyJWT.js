const axios = require('axios');
const fs = require('fs');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers['authorization']; 
  const publicKey  = fs.readFileSync('./authentication/public.key', 'utf8');
  jwt.verify(token, publicKey, {algorithm: ["RS256"]}, function(err, decoded) { 
    if(!decoded){
      req.user = null;
      return next();
    }

    axios.get(`${process.env.USER_SERVICE}/${decoded.id}`)
    .then(resp => {
      req.user = resp.data;
    })
    .catch(err => {
      req.user = null;
    })
    .finally(() => {
      next();
    });
  });
}
