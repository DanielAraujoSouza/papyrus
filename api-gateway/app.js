const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport')  
const session = require('express-session')  
const MongoStore = require('connect-mongo')(session)
require('dotenv-safe')
  .config({
    path: `${__dirname}/.env`, 
    example: `${__dirname}/.env.example`
  });
const helmet = require('helmet');

const webUiRouter = require(`${__dirname}/routes/webUI`);
const usersRouter = require(`${__dirname}/routes/users`);
const booksRouter = require(`${__dirname}/routes/books`);
const ebooksRouter = require(`${__dirname}/routes/ebooks`);
const authorRouter = require(`${__dirname}/routes/author`);

const app = express();

app.use(logger('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Authentication
require(`${__dirname}/authentication`)(passport);
app.use(session({
  store: new MongoStore({
    url: process.env.MONGO_CONNECTION,
    ttl: 30 * 60 // = 30 minutos de sessão
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', webUiRouter);
app.use('/users', usersRouter);
app.use('/book', booksRouter);
app.use('/ebook', ebooksRouter);
app.use('/author', authorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.sendStatus(404);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.sendStatus(err.status || 500);
});

module.exports = app;
