require('dotenv-safe').config();
const createError = require("http-errors");
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const verifJWT = require("../authentication/verifyJWT");
let server = null;

function start(api, callback){

  const app = express();
  const router = express.Router();

  // view engine setup
  app.set("views", path.join(__dirname, "../views"));
  app.set("view engine", "ejs");
  app.use(expressLayouts);
  app.set("layout extractScripts", true);

  // Arquivos estáticos
  app.use('/web-ui/', express.static(path.join(__dirname, "../public")));

  app.use(morgan('dev'));
  app.use(express.json());
  app.use(helmet());
  app.use(cookieParser());
  app.use((err, req, res, next) => {
    callback(new Error('Something went wrong!, err:' + err), null);
    res.status(500).send('Something went wrong!');
  });
  app.use(verifJWT);
  app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "img-src * 'self' data: https:;");
    return next();
  });
  app.use('/web-ui/', router);
  
  api(router);

  server = app.listen(parseInt(process.env.SERVER_PORT), () => callback(null, server));
}

function stop(){
  if(server) server.close();
  return true;
}

module.exports = { start, stop }