// DB 연결 설정
var mysql = require('mysql');
var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'hy5643212',
  database : 'FISH',
  connectionLimit : 50
});
module.exports = pooling;
