module.exports = {
  apps : [
  {
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
  }, 
  {
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
  }, 
  {
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
  }, 
  {
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
  }, 
  {
    name: "Gateway",
    script: "node ./bin/www",
    cwd: "./api-gateway",
    watch: true,
    ignore_watch : ["data", "uploads"],
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  },
  {
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