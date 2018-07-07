// var pooling = require('../../routes/db_pooling');
// DB 연결 설정
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
module.exports = new LocalStrategy({
		usernameField : 'id_email',
		passwordField : 'password',
		passReqToCallback : true   // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, id_email, password, done) {

		console.log('passport의 local-login 호출됨 : ' + id_email + ', ' + password);
    console.log('개인회원/기업회원 : ' + req.body.sel);


		var findUser = 'select * from user where user_email = ?;';
		pool.getConnection(function(err, conn){
				conn.query(findUser, [id_email], function(err, rows){
					if(err) console.log(err.message);

					console.log('find user 결과 출력');

					var user = rows[0];
					console.log(user);

					if(!user){
						console.log('계정이 일치하지 않음.');
						return done(null, false, req.flash('loginMessage', '등록된 계정이 없습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
					}

          // 기업회원, 개인회원 잘못 선택한 경우
          if(req.body.sel != user.user_type){
            console.log('개인회원/기업회원 선택 확인');
            return done(null, false, req.flash('loginMessage', '해당하는 회원이 존재하지 않습니다.'));
          }

						// 비밀번호 비교하여 맞지 않는 경우
					// var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
					// if (!authenticated) {
					// 	console.log('비밀번호 일치하지 않음.');
					// 	return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
					// }

					if (!bcrypt.compareSync(password, user.hpassword))
					  return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));



					// 정상인 경우
					console.log('계정과 비밀번호가 일치함.');
          return done(null, user);  // 검증 콜백에서 두 번째 파라미터의 값을 user 객체로 넣어 인증 성공한 것으로 처리
					});
		});
});
