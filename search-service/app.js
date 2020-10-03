require("dotenv-safe").config();
const apiV1 = require('./api/v1');
const server = require("./server/server");

server.start(apiV1, (err, app) => { 
  console.log(`Server started on port ${process.env.SERVER_PORT}`);
});