var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register');
var mysql = require('mysql');
var app = express();

var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'hy5643212',
  database : 'FISH'
});

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

app.use('/', index);
app.use('/users', users);
app.use('/register', register);


app.post('/reg_receiver', function(req, res){
  var params = new Array();
  params[0] = req.body.emailId + '@' + req.body.domain;
  params[1] = req.body.password;
  params[2] = req.body.name;
  if(params[0] == ""){
    res.send('이메일을 정확히 입력해 주세요.');
  }
  if(params[1] == ""){
    res.send('패스워드를 입력해 주세요.');
  }
  if(params[2] == ""){
    res.send('이름을 입력해 주세요.');
  }
  var sql_select = 'SELECT COUNT(*) AS namesCount FROM user WHERE user_email = ?;';

  conn.query(sql_select, params[0], function (err, rows, fields) {
    // Use the connection
    if (err) {
      console.log(err);
    } 
    else {
      console.log('동일 계정 갯수: ' + rows[0].namesCount);
      if(rows[0].namesCount == 0) insert_user();
      else {
        console.log('동일 계정 갯수: ' + rows[0].namesCount);
        res.send('이미 등록된 이메일 계정입니다.');
        
      } 
    }
  });
  function insert_user() {
    res.send('환영합니다.' + params[2] + '님.');

    var sql_insert = 'INSERT INTO user(user_email, user_pw, user_name) VALUES (?,?,?);';

    conn.query(sql_insert, params, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        console.log(rows);
      }
    });
    conn.end();
  }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


var server = app.listen(3003, function(){
 console.log("Express server has started on port 3003")
});

