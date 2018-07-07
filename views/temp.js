$.ajax({
  url: '/updateData',
  type: 'post',
  data: {user_email: user_email},						// 사용자 식별할 기본키값 (db 쿼리에 필요한)
  dataType: 'text',
  success: function(data) {
    var json = JSON.parse(data);
    if (json.code == '1') {              // 업데이트 ok.
      // dataArray.push(json.data);
      // alert('dataArray : ' + dataArray);


      // @@@@@@@@@@@@@@ test!!!!!! @@@@@@@@@@@@@@@@
      // 1) 원래 방식 (redirect)
      location.href="/entMain";

      // 2) jquery로 값 넣어주는 방식
      // for(i=0; i<json.rows.length; i++){
      //   $("input[name='msrTemp']")[i].value = json.rows[i].msrTemp;
      //   $("input[name='msrPH']")[i].value = json.rows[i].msrPH;
      //   $("input[name='msrLED']")[i].value = json.rows[i].msrLED;
      //   $("input[name='msrHeater']")[i].value = json.rows[i].msrHeater;
      //
      // }


    } else {                           // 업데이트 실패했을 경우
      // alert('장애가 발생했습니다.\n네트워크 환경을 다시 확인해주세요');
      alert('측정할 데이터가 존재하지 않습니다.\n측정해주세요!!!!!!!!!!!!!!!!!!');
    }
  }
});








$("input[name=goGraph]").click(function(e){

  var device_code = $("input[name='goGraph']").val();
  console.log(device_code);
  alert(device_code + '디바이스의 백업 데이터를 확인합니다.');


  var chartData;

  $.ajax({
    url: '/goGraph/'+device_code,
    type: 'get',
    success: function(data) {
      chartData = data;
      console.log(data);
    }
  });

  $('#graph').modal('show');

  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
          datasets: [{
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });


});
