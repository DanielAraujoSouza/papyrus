const mongoose = require('mongoose');
require('dotenv-safe').config();
let connection = null;

function connect(callback){
  if(connection) return callback(null);
  mongoose.connect(process.env.MONGO_CONNECTION, { 
    useCreateIndex: true, 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false 
  })
  .then((result) => {
    connection = result;
    return callback(null);
  })
  .catch(err => {
    return callback(err);
  });
}

function disconnect(){
  if(!connection) return true;
  mongoose.disconnect(); 
  connection = null;
  return true;
}

module.exports = { connect, disconnect }