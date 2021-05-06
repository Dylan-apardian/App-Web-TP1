var express = require('express');
var app = express();
var session = require('express-session');
var bcrypt = require('bcrypt')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

// Passport
var initializePassport = require('./config/passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

// DB Config
var db = require('./config/database').mongoURI;

//connect to MongoDB
mongoose.connect(db, 
  { useUnifiedTopology: true, useNewUrlParser: true }
  )
.then(() => console.log('MongoDB Connecté'))
.catch(err => console.log(err));

// EJS
app.set('view engine', 'ejs')


// //handle mongo error
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   // we're connected!
// });

//use sessions for tracking logins
 app.use(session({
  secret: 'work hard',
   resave: true,
   saveUninitialized: false,
//   store: new MongoStore({
//     mongooseConnection: db
   })
 );

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// serve static files from template
app.use(express.static(__dirname + '/views/Pages'));

// include routes
var routes = require('./routes/router');
const User = require('./models/user');
app.use('/', routes);
app.use('/', require('./routes/index.js'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});