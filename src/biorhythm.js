import moment from 'moment'

exports.handler = function(event, context, callback) {
  console.log(JSON.stringify(event, null, 4))

  const data = create_data(moment("1960-02-23"))
  console.log(JSON.stringify(data, null, 4))
  callback(null, {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(data, null, 4)
  });
}

function create_data(birthday) {

  // https://keisan.casio.jp/exec/system/1231994137
  // 基準日を現在日に指定
  const base_date = moment()
  
  let graph_data = []
  for (let i = -30; i <= 30; i++) {
    const cur_date = base_date.clone().add(i, 'days')
    const cur_time = base_date.clone().add(i, 'days').format('YYYY-MM-DD')
    // 経過日数
    const elapsed_days = cur_date.clone().diff(birthday, "days") 

    //biorhythm data
    const [p_v, s_v, i_v] = (function() {
        const pi = Math.PI
        const bio_func = (function(T) {
            return Math.sin(elapsed_days * 2 * pi / T).toFixed(4)
        })
        const physical     = bio_func(23);
        const sensitivity  = bio_func(28);
        const intellectual = bio_func(33);
        return [physical, sensitivity, intellectual]
    })();

    const cur_data = {time: cur_time, elapsed_days: elapsed_days, value: i, physical: p_v, sensitivity: s_v, intellectual: i_v}
    graph_data.push(cur_data)
  }
  const data = {
    version: '1.0.0',
    data: graph_data
  };
  return data;
}
