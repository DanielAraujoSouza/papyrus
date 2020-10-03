require('dotenv-safe').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
let server = null;

function start(api, repository, callback){

  const app = express();
  const router = express.Router();
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(helmet());
  app.use((err, req, res, next) => {
    callback(new Error('Something went wrong!, err:' + err), null);
    res.status(500).send('Something went wrong!');
  })
  app.use('/authors', router);
  
  api(router, repository);

  server = app.listen(parseInt(process.env.SERVER_PORT), () => callback(null, server));
}

function stop(){
  if(server) server.close();
  return true;
}

module.exports = { start, stop }