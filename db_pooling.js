
var generic_pool = require("generic-pool");
var mysql = require("mysql");

// local env
config = {
    host     : 'localhost',
    user     : 'root',
    password : 'hy5643212',
    database : 'FISH',
    connectionLimit : 50
};

const pooling = generic_pool.createPool({
    name:"mysql",
    create:function(cb){
        var conn = mysql.createConnection(config);
        conn.connect(function(err){
            if( err) console.log("mysql 연결오류");
            else {
             console.log("mysql 연결성공");
            }   cb(err, conn);
            // 콜백함수를 통해 풀링에 커넥션 객체를 던짐
        });
    },
    destroy:function(myConn){
        myConn.end(function(err){
            if( err)    console.log("mysql 연결해제오류");
         else        console.log("mysql 연결해제성공");
        });
    },
    min:1,
    max:2,
    idleTimeoutMillis:1000*500,
    log:false

});

process.on("exit", function(){
    pooling.drain(function(){
        pooling.destroyAllNow();
    });
});

module.exports = pooling;
