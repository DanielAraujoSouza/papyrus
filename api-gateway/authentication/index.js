const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy
require('dotenv-safe')
  .config({
    path: `${__dirname}/../.env`, 
    example: `${__dirname}/../.env.example`
  });
const axios = require('axios');

module.exports = (passport) => {
  
  function findUser(param, callback) {
    console.log(param)
    axios.get(`${process.env.USER_SERVICE}/${param}`)
    .then((resp) => {
      callback(null, resp.data);
    }).catch((err) => {
      callback(err, null);
    });;
  }

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    
    findUser(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy({
      usernameField: 'userEmail',
      passwordField: 'userPassword'
    },
    (email, password, done) => {
      findUser(email, (err, user) => {
        if (err) {
          return done(err)
        }

        // usuário inexistente
        if (!user) {
          return done(null, false)
        }

        // comparando as senhas
        bcrypt.compare(password, user.password, (err, isValid) => {
          if (err) {
            return done(err)
          }
          if (!isValid) {
            return done(null, false)
          }
          return done(null, user)
        })
      })
    }
  ));
}