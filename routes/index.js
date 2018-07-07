var express = require('express');
var router = express.Router();
var app       =     require("express")();
var mysql     =     require("mysql");
app.io = require('socket.io')();
var mysql = require('mysql');
var MySQLEvents = require('mysql-events');
var pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'hy5643212',
  database : 'FISH',
  connectionLimit : 50
});
var iochat = require('./socketConnection');



// 기업 회원 메인 화면
router.route('/entMain').get(function(req, res) {
    console.log('/entMain 패스 요청됨.');

    // 인증된 경우, req.user 객체에 사용자 정보 있으며, 인증안된 경우 req.user는 false값임
    console.log('req.user 객체의 값');
    console.dir(req.user);

    // 인증 안된 경우
    if (!req.user) {
        console.log('사용자 인증 안된 상태임.');
        res.redirect('/');
    } else {
        console.log('사용자 인증된 상태임.');
        console.log('/entMain 패스 요청됨.');


        var user_email = req.user.user_email;
        var device_code_query = 'select device_code from user_device where user_email = ?;';
        var checkAll = 'select * from entMsrData where device_code in (select device_code from user_device where user_email = ? );';        // 등록한 기기가 있는지 확인 -> 있으면 entDeviceData 값들 반환 / 없으면 null
        var valueCheck = 'select * from entDeviceData where device_code in (select device_code from user_device where user_email = ? );';
        var backup_query = 'select * from entMsrDataAcc where device_code in (select device_code from user_device where user_email = ?);';
        var species_query = 'select * from deviceSpecies where device_code in (select device_code from user_device where user_email = ?);';


        var message = [];

        let device_code;

        pool.getConnection(function(err, conn){
          conn.query(valueCheck, [user_email], function(err, results){           // entDeviceData 조회 (등록된 기기 있는지 없는지)

            if(!results[0]){    // 등록된 수조 및 기기 정보 없는 경우
              console.log('데이터 없음, 기기 등록 페이지로 이동');
              res.redirect('/addDevice');
            }

            else{               // 등록된 수조 및 기기 정보 있는 경우
              conn.query(checkAll, [user_email], function(err, rows){      // entMsrData  조회  (측정된 데이터 있는지 없는지)
                if(!rows[0]){
                  console.log('아직 측정된 데이터 값 없음');
                  message.push({msg : '아직 측정 안됐어요!!!!!!!!!!측정해주세요!!!!!!!!!!!!!!'});
                  res.render('entMain.ejs', {user_email : user_email, message: message, msrData : 0});
                }
                else{

                  for(i=0; i<rows.length; i++){
                      if(rows[i].msrPH < results[i].ph_value - results[i].ph_dev || rows[i].msrPH > results[i].ph_value + results[i].ph_dev){
                        console.log('ph 기준 범위값을 벗어남');
                        var device_code = rows[i].device_code;
                        message.push({device_code : device_code , msg : 'ph 기준 범위값을 벗어남'});
                      }

                      if(rows[i].msrTemp < results[i].temp_value - results[i].temp_dev || rows[i].msrTemp > results[i].temp_value + results[i].temp_dev){
                        console.log('온도 기준 범위값을 벗어남');
                        var device_code = rows[i].device_code;
                        message.push({device_code : device_code , msg : '온도 기준 범위값을 벗어남'});
                      }
                  }

                  console.log('메시지 갯수 : ' + message.length);

                  // 2) 백업 데이터 값 받아오는 쿼리 (그래프용)
                  // conn.query(backup_query, [user_email], function(err, backupData){

                    // 3)  수조에 있는 물고기 정보 받아오는 쿼리
                    conn.query(species_query, [user_email], function(err, speciesData){
                      if(message.length == 0){
                        console.log('수조 이상 없음');

                        // var subscription = speciesData;
                        // var payload = JSON.stringify({title: '수조 이상 없음'});
                        // webpush.sendNotification(subscription, payload).catch(err => console.log(err));

                        res.render('entMain.ejs', {user_email : user_email , msrData: rows, configData: results, message: message, speciesData: speciesData});
                      }
                      else{
                        console.log('수조 이상 있음');

                        // var subscription = speciesData;
                        // var payload = JSON.stringify({title: '수조 이상 있음'});
                        // webpush.sendNotification(subscription, payload).catch(err => console.log(err));

                        res.render('entMain.ejs', {user_email : user_email , msrData: rows, configData: results, message: message, speciesData: speciesData});
                      }
                    });

                  // });



                }
              });
            }
          });
          conn.release();
        });








        // pool.getConnection(function(err, conn){
        //
        //       conn.query(checkAll, [user_email], function(err, results){
        //
        //         if(!results[0]){        // 등록된 수조 정보가 없으면
        //             console.log('데이터 없음, 기기 등록 페이지로 이동');
        //             res.redirect('/addDevice');
        //         } else{                   // 등록된 수조 정보가 있으면 -> 해당 사용자의  entMsrData 값들 반환됨
        //             conn.query(viewAll, [user_id], function(err, rows){
        //                 console.log('성공적으로 조회');
        //                 // console.log('rows.length : ' + rows.length);
        //
        //                 if(!rows[0]){
        //                   console.log('아직 측정된 데이터 값 없음');
        //                 }
        //
        //
        //                 for(i=0; i<rows.length; i++){
        //
        //
        //                       if(rows[i].msrPH < results[i].ph_value - results[i].ph_dev || rows[i].msrPH > results[i].ph_value + results[i].ph_dev){
        //                         console.log('ph 기준 범위값을 벗어남');
        //                         var device_code = rows[i].device_code;
        //                         message.push({device_code : device_code , msg : 'ph 기준 범위값을 벗어남'});
        //                         // message[i].ph = 'ph 기준 범위값을 벗어남';
        //                       }
        //
        //                       if(rows[i].msrTemp < results[i].temp_value - results[i].temp_dev || rows[i].msrTemp > results[i].temp_value + results[i].temp_dev){
        //                         console.log('온도 기준 범위값을 벗어남');
        //                         var device_code = rows[i].device_code;
        //                         message.push({device_code : device_code , msg : '온도 기준 범위값을 벗어남'});
        //                         // message[i].temp = '온도 기준 범위값을 벗어남';
        //                       }
        //
        //
        //
        //
        //                 }
        //
        //
        //
        //                 // if(rows[0].msrPH < results[0].ph_value - results[0].ph_dev || rows[0].msrPH > results[0].ph_value + results[0].ph_dev){
        //                 //   console.log('ph 기준 범위값을 벗어남');
        //                 //   message.ph = 'ph 기준 범위값을 벗어남';
        //                 // }
        //                 //
        //                 // if(rows[0].msrTemp < results[0].temp_value - results[0].temp_dev || rows[0].msrTemp > results[0].temp_value + results[0].temp_dev){
        //                 //   console.log('온도 기준 범위값을 벗어남');
        //                 //   message.temp = '온도 기준 범위값을 벗어남';
        //                 // }
        //
        //
        //
        //
        //
        //
        //
        //                 console.log('메시지 갯수 : ' + message.length);
        //                 if(message.length == 0){
        //                   console.log('수조 이상 없음');
        //                   res.render('entMain.ejs', {msrData: rows, configData: results, message: message});
        //                 }
        //                 else{
        //                   console.log('수조 이상 있음');
        //                   res.render('entMain.ejs', {msrData: rows, configData: results, message: message});
        //                 }
        //             });
        //         }
        //
        //       });
        //
        // });








        ////////////////////////////

                    // io.on('connection',function(socket){
                    //     console.log("entDeviceData DB 정보가 업데이트됨");
                    //     socket.on('status added',function(user_id){              // on : 여기서 받는 소켓 정보는 user_id / user_email 정보.
                    //       add_status(user_id, function(res){                      //      받아서 해당 유저가 가진 수조 db가 업데이트 되었는지 확인하는 과정 필요.
                    //         if(res){
                    //             io.emit('refresh feed', res);
                    //         } else {
                    //             io.emit('error');
                    //         }
                    //       });
                    //     });
                    // });
                    //
                    // var add_status = function (user_id, callback) {
                    //     pool.getConnection(function(err,connection){
                    //         if (err) {
                    //           callback(false);
                    //           return;
                    //         }
                    //     connection.query("INSERT INTO `status` (`s_text`) VALUES ('"+status+"')",function(err,rows){
                    //     // connection.query("INSERT INTO `status` (`s_text`) VALUES ('"+status+"')",function(err,rows){
                    //             connection.release();
                    //             if(!err) {
                    //               callback(true);
                    //             }
                    //         });
                    //      connection.on('error', function(err) {
                    //               callback(false);
                    //               return;
                    //         });
                    //     });
                    // }

        ///////////////////////////////







    } // else문 끝
});




router.route('/goGraph/:device_code').get(function(req, res) {
  var device_code = req.params['device_code'];
  var user_email = req.user.user_email;

  res.render('graph.ejs', {user: req.user, device_code: device_code});

});


router.route('/goGraph').post(function(req, res){
  var device_code = req.body.device_code;
  var user_email = req.user.user_email;
  var viewQuery = 'select * from entMsrDataAcc where device_code = ?;';
  var item = {};

  pool.getConnection(function(err, conn){
    conn.query(viewQuery, [device_code], function(err, rows){

      // res.end(JSON.stringify(rows));
      res.json(rows);
    });
  });
});




// 기기 등록 화면
router.route('/addDevice').get(function(req, res) {
    console.log('/addDevice get 패스 요청됨.');

    var dataQuery = 'select * from speciesData;';
    pool.getConnection(function(err, conn){
      conn.query(dataQuery, function(err, rows){
        res.render('addDevice.ejs', {user: req.user, speciesData: rows});
      });
    });

});

// 기기 등록
router.route('/register').post(function(req, res) {
    console.log('/register post 패스 요청됨.');

    var user_email = req.body.user_email;
    // var user_email = req.user.user_email;

    var obj = JSON.parse(req.body.itemArray);
    var sobj = JSON.parse(req.body.speciesArray);

    console.log('객체(배열) 길이 : ' + obj.length);
    console.log('sobj.length : ' + sobj.length);
    console.log('user_email : ' + user_email);
    // console.log(obj[0].device_code);
    // console.log('sobj[0].device_code , sobj[0].speciesName , sobj[0].num : ' + sobj[0].device_code +"/"+ sobj[0].speciesName +"/"+ sobj[0].num);
    // console.log('sobj[1].device_code , sobj[1].speciesName , sobj[1].num : ' + sobj[1].device_code +"/"+ sobj[1].speciesName +"/"+ sobj[1].num);
    // console.log('sobj[2].device_code , sobj[2].speciesName , sobj[2].num : ' + sobj[2].device_code +"/"+ sobj[2].speciesName +"/"+ sobj[2].num);
    // console.log('sobj[3].device_code , sobj[3].speciesName , sobj[3].num : ' + sobj[3].device_code +"/"+ sobj[3].speciesName +"/"+ sobj[3].num);
    // console.log('----------이 위로 device_code 파싱');

    var resultCode = "0";
    var item= {};
    var device_code


    // ****** 1) user_deviceQuery : user_device 테이블에 user_email, device_code 등록하는 쿼리
    // ****** 2) regDeviceQuery : entDeviceData 테이블에 기타 수조 정보 등록하는 쿼리
    // ****** 3) deviceSpeciesQuery : deviceSpecies 테이블에 device_code, species_code, num 등록하는 쿼리
    var user_deviceQuery = 'INSERT INTO user_device (user_email, device_code) VALUES (?, ?);';
    var regDeviceQuery = 'INSERT INTO entDeviceData (device_code, tank_name, width_size, height_size, depth_size, temp_value, temp_dev, ph_value, ph_dev) VALUES (?,?,?,?,?,?,?,?,?);';
    var deviceSpeciesQuery = 'INSERT INTO deviceSpecies (device_code, species_name, num) VALUES (?, ?, ?);';

    pool.getConnection(function(err, conn){
      for (var i = 0; i < obj.length; i++) {        // 수조 개수만큼 정보 insert
        device_code = obj[i].device_code;
        console.log('device_code : ' + device_code);
        conn.query(user_deviceQuery, [user_email, device_code], function(err, rows){
          if(err){
            console.log(err.message);
            console.log('user_deviceQuery 실패');
          }
          console.log('user_deviceQuery 완료');
        });

        for (j=0; j<sobj.length; j++){              // 총 어종정보 개수만큼 insert (사용자로부터 받은 어종 수 만큼 insert)
              conn.query(deviceSpeciesQuery, [sobj[j].device_code, sobj[j].speciesName, sobj[j].num], function(err2, rows2){
                if(err2){
                  console.log(err2.message);
                }
                console.log('deviceSpeciesQuery 이후 처리 쿼리 : ' + rows2);
                console.log('addDevice - ' + user_email + '의 수조 정보 등록 완료');
                resultCode = "1";
                item.code = resultCode;
                res.end(JSON.stringify(item));
              });
        }


        conn.query(regDeviceQuery, [obj[i].device_code, obj[i].tank_name, obj[i].width, obj[i].height, obj[i].depth, obj[i].tempSet, obj[i].temp_gap, obj[i].phSet, obj[i].ph_gap], function(err, results){

          if(err){
            console.log(err.message);
            console.log('regDeviceQuery 실패');
          }
          console.log('regDeviceQuery 완료');
        }); // conn.query
      }
    });

});



// 로그인 처리 후 15분마다 PH 업데이트
router.post('/updateData', function(req, res){
      var resultCode = "0";
      var item = {};
      var user_email = req.body.user_email;

      var select_query = 'select * from entMsrData where device_code in (select device_code from user_device where user_email = ? )';

      pool.getConnection(function(err, conn){
        conn.query(select_query, [user_email], function(err, rows){
          if(err) console.log(err.message);
          else{

            if(!rows[0]){                // 사용자 정보와 일치하는 device 가 없을 때
              item.code = resultCode;
              console.log('아직 측정 데이터가 존재하지 않습니다.');
            }
            else{                     // 사용자 정보와 일치하는 device 가 있을 때
              console.log(rows);
              console.log('측정 데이터가 존재합니다.');
              // 응답코드 생성
              resultCode = "1";
              item.code = resultCode;
            }

            res.end(JSON.stringify(item));
          }
          // res.render('entMain.ejs', {data: rows});
          conn.release();
        });
      });
});



router.route('/codeCheck').post(function(req, res) {
      console.log('/codeCheck 디바이스 코드 중복체크');

      var device_code = req.body.device_code;
      console.log('device_code : ' + device_code);

      var resultCode = "0";
      var item= {};
      var select_query = 'select * from entDeviceData where device_code = ?';

      pool.getConnection(function(err, conn){
        conn.query(select_query, [device_code], function(err, rows){
          if(err) console.log(err.message);
          else{

            if(!rows[0]){                // 사용자 정보와 일치하는 device_code 가 없을 때 (해당 코드 사용 가능)
              resultCode = "1";
              item.code = resultCode;
            }

            else{                     // 사용자 정보와 일치하는 device_code 가 있을 때 (해당 코드 사용 불가능)
              item.code = resultCode;
            }
          }
          res.end(JSON.stringify(item));
          // conn.release();
        });
      });
});



router.post('/search', function(req, res){

      console.log('/search 호출됨');

      var searchQuery;
      var user_email = req.user.user_email;
      var query = req.body.query;
      console.log('query : ' + query);
      let check;

      //////////////////////////////////////////////////////////
      //  입력받은 첫글자가 숫자면 -> device_code 검색          //
      //  입력받은 첫글자가 영어, 한글이면 -> species_name 검색  //
      //////////////////////////////////////////////////////////
      chr = query.charAt(0);
      console.log(chr);

      if (chr < 48 || chr > 57) {
        console.log('이건 숫자');
        check = 0;
        searchQuery = 'SELECT device_code FROM user_device WHERE device_code like "%'+query+'%" and user_email = ?;';
      }
      else {
        console.log('이건 문자');
        check = 1;
        searchQuery = 'SELECT d.device_code, species_name FROM user_device u, deviceSpecies d WHERE species_name like "%' + query + '%" and u.device_code = d.device_code and u.user_email = ?;';
      }


      // 검색 부분
      pool.getConnection(function(err, conn){
        conn.query(searchQuery, [user_email], function(err, rows){
          var data = new Array();
          if(err) console.log(err.message);
          else{

            if(!rows[0]){                // 일치하는 정보가 없을 때
              console.log('출력할 데이터 없음');
              res.end(JSON.stringify(data));
            }

            else{
              if(check == 0){
                for(i=0; i<rows.length; i++){
                  data.push(rows[i].device_code);
                }
              }
              else{
                for(i=0; i<rows.length; i++){
                  var temp_arr = new Array();
                  temp_arr.push(rows[i].device_code);
                  temp_arr.push(rows[i].species_name);
                  data.push(temp_arr);
                }
              }


              console.log(data);
            }
          }
          res.end(JSON.stringify(data));
          // conn.release();
        });
      });
});


router.route('/book').get(function(req, res) {
    res.render('book.ejs', {user: req.user});
});


module.exports = router;
