// var pooling = require('../../routes/db_pooling');
var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'hy5643212',
  database : 'FISH',
  connectionLimit : 50
});

var LocalStrategy = require('passport-local').Strategy;
module.exports = new LocalStrategy
({
		usernameField : 'id_email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, id_email, password, done) {
        // 요청 파라미터 중 name 파라미터 확인
        var entName = req.body.entName || req.query.entName;
        var address = req.body.address || req.query.address;

				console.log('passport의 local-signup 호출됨 : ' + id_email + ', ' + password + ', ' + entName);
				console.log('사용자 이름 : ' + entName);
		    process.nextTick(function() {
						pool.getConnection(function(err, conn){

    						var sql_select = 'SELECT COUNT(*) AS namesCount FROM entUser WHERE user_email = ?;';
    						conn.query(sql_select, id_email, function (err, rows, fields) {
    					    // Use the connection
    					    if (err) {
    					      console.log(err);
    					    }
    					    else {
    					      console.log('동일 계정 갯수: ' + rows[0].namesCount);
    					      if (rows[0].namesCount == 0) insert_user();
    					      else {
    									return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
    					      }
    					    }
    					  });

    					  function insert_user() {

    							var newUser = {
    								user_email: id_email,
    								user_pw: password,
    								hpassword: bcrypt.hashSync(password, null, null),
    								entName: entName,
                    rank: 1,
                    address: address
    							};

    					    var sql_insert = 'INSERT INTO entUser(user_email, user_pw, hpassword, entName, rank, address) VALUES (?,?,?,?,?,?);';

    					    conn.query(sql_insert, [newUser.user_email, newUser.user_pw, newUser.hpassword, newUser.entName, newUser.rank, newUser.address], function (err, rows, fields) {
    					      if (err) {
    					        console.log(err);
    					      } else {

                      console.log('정상적으로 기업 회원 추가됨');
                      return done(null, newUser);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리

                    }
    					    });
    					    conn.release();
    					  }

		    		});

				});
});
