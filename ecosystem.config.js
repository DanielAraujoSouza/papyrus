module.exports = {
  apps : [{
    name: "UsersDB",
    script: "mongod --port=27018 --dbpath ./data",
    cwd: "./user-service"
  },{
    name: "UserService",
    script: "node app",
    cwd: "./user-service",
    watch: true,
    ignore_watch : ["data"],
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }, {
    name: "BookDB",
    script: "mongod --port=27019 --dbpath ./data",
    cwd: "./book-service"
  },{
    name: "BookService",
    script: "node app",
    cwd: "./book-service",
    watch: true,
    ignore_watch : ["data"],
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }, {
    name: "AuthorDB",
    script: "mongod --port=27020 --dbpath ./data",
    cwd: "./author-service"
  }, {
    name: "AuthorService",
    script: "node app",
    cwd: "./author-service",
    watch: true,
    ignore_watch : ["data"],
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }, {
    name: "WebUiService",
    script: "node app",
    cwd: "./web-ui-service",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }, {
    name: "GatewayDB",
    script: "mongod --port=27017 --dbpath ./data",
    cwd: "./api-gateway"
  }, {
    name: "Gateway",
    script: "node ./bin/www",
    cwd: "./api-gateway",
    watch: true,
    ignore_watch : ["data"],
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  },{
    name: "SearchService",
    script: "node app",
    cwd: "./search-service",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};