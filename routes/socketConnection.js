// function socket(io) {
//   // start listen with socket.io
//   io.on('connection', function(socket){
//     console.log('a user connected');
//     socket.emit('chat message', '1번수조 이상있음');
//   });
// }

function socket(io, data) {
  // console.log('socketConnection 에서 받은 rows' + data);
  // start listen with socket.io
  io.on('connection', function(socket){
    console.log('socketConnection에서 받은 code : ' + data[0].device_code);
    socket.emit('updateMsg', data);
  });
}

module.exports = socket;
