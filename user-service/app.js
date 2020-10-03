require("dotenv-safe").config();
const apiV1 = require('./api/v1');
const server = require("./server/server");
const repository = require("./repository/repository");

server.start(apiV1, repository, (err, app) => { 
  console.log(`Server started on port ${process.env.SERVER_PORT}`);
  console.log(`Database Server ${process.env.MONGO_CONNECTION}`);
});