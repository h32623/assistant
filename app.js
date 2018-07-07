var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressSession = require('express-session');
var config = require('./config/config');
var route_loader = require('./routes/route_loader');
var mysql = require('mysql');
var fs = require('fs');
var pooling = require('./routes/db_pooling');
var app = express();
// var FCM = require('fcm-node');
app.io = require('socket.io')();
// iochat(app.io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// **** passport 사용 ****
var passport = require('passport');
var flash = require('connect-flash');
var router = express.Router();

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

// // DB 연결 설정
// var mysql = require('mysql');
// var pool = mysql.createPool({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'hy5643212',
//   database : 'FISH',
//   connectionLimit : 50
// });

// **** passport 사용 ****
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, router);

// 패스포트 설정
var configPassport = require('./config/passport');
configPassport(app, passport);

// 패스포트 라우팅 설정
var userPassport = require('./routes/user_passport');
userPassport(router, passport);


var index = require('./routes/index');
app.use('/', index);
// app.use('/users', users);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.io.on('connection', function (socket) {
// 	console.log('연결되었습니다.');
// });


module.exports = app;
