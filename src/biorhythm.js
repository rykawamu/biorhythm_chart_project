import moment from 'moment'

exports.handler = function(event, context, callback) {
  console.debug(JSON.stringify(event, null, 4))

  const qsp = event.queryStringParameters;
  const param = {
    birth_date_str: qsp.birth_date,
    base_date_str:  qsp.base_date,
  }
  const [birth_date, base_date] = biorhythm_param_date(param);

  const data = create_data(birth_date, base_date)
  console.debug(JSON.stringify(data, null, 4))

  callback(null, {
    statusCode: 200,
    headers: {
      'Content-type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(data, null, 4)
  });
}

/**
 * バイオリズムデータのパラメータになる日付データを返します
 * @param {Object} param param クエリストリングから取得した「誕生日」「基準日」の情報。
 * @return [Moment, Moment] Momentオブジェクトを「誕生日」「基準日」で配列形式で格納
 */
function biorhythm_param_date(param) {
  console.debug("[" + param.birth_date_str + "]:[" + param.base_date_str + "]");
  const target_date = function(param_str, default_date) {
    if (moment(param_str, 'YYYY-MM-DD', true).isValid()) {
      return moment(param_str);
    } else {
      return default_date;
    }
  }

  // 陛下の誕生日をデフォルト指定
  const birth_date = target_date(param.birth_date_str, moment("1960-02-23"))
  // https://keisan.casio.jp/exec/system/1231994137
  // 基準日を現在日に指定
  const base_date  = target_date(param.base_date_str, moment());
  return [birth_date, base_date];
}

/**
 * jsonデータを作成する。作成データは基準日の前後30日分を含めた、当該誕生日のバイオリズムデータ
 * @param {Moment} birth_date 誕生日のMomentオブジェクト
 * @param {Moment} base_date 基準日のMomentオブジェクト
 * @return {Object} バイオリズムデータの含まれたjsonデータ
 */
function create_data(birth_date, base_date) {

  let graph_data = []
  for (let i = -30; i <= 30; i++) {
    const cur_date = base_date.clone().add(i, 'days')
    const cur_date_str = cur_date.format('YYYY-MM-DD')
    // 経過日数
    const elapsed_days = cur_date.clone().diff(birth_date, "days")

    //Create biorhythm data
    const [p_v, s_v, i_v] = (function() {
        const pi = Math.PI
        const biorhythm_func = (function(T) {
            return Math.sin(elapsed_days * 2 * pi / T).toFixed(4)
        })
        const physical     = biorhythm_func(23);
        const sensitivity  = biorhythm_func(28);
        const intellectual = biorhythm_func(33);
        return [physical, sensitivity, intellectual]
    })();

    // element: biorhythm data of one day
    const graph_element = {time: cur_date_str,
      elapsed_days: elapsed_days, value: i,
      physical: p_v, sensitivity: s_v, intellectual: i_v
    }
    graph_data.push(graph_element)
  }

  // json data
  const data = {
    version: '1.0.0',
    birth_date: birth_date.clone().format('YYYY-MM-DD'),
    base_date: base_date.clone().format('YYYY-MM-DD'),
    data: graph_data
  };
  return data;
}
