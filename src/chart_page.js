const fs = require('fs');

exports.handler = function(event, context, callback) {

  console.log(JSON.stringify(event, null, 4))

  const qsp = event.queryStringParameters;
  const page = qsp.page
  // 即時関数で処理分岐
  const filepath = (function(pg){
    let path = './public/index.html'
    switch (pg) {
      case '1':
        path = './public/chart_c3.html';
        break;
      case '2':
        path = './public/chart_chart.html';
        break;
      case '3':
        path = './public/chart_google.html';
        break;
      default:
    }
    console.log('target file :' + path);
    return path;
  }(page));

  const text = fs.readFileSync(filepath, 'utf8');
  console.log(text);

  callback(null, {
    statusCode: 200,
    body: text
  });
}
