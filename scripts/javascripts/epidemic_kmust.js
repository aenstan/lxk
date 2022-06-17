/**
 * 
 * 使用方法：打开我在校园，点击日检日报即可，但是由于请求体包含哈希算法加密，需要使用脚本请联系脚本作者。
 * 联系地址：https://t.me/chiupam
 * 
 * Surge's Moudule: https://raw.githubusercontent.com/chiupam/surge/main/Surge/KMUST.sgmodule
 * BoxJs: https://raw.githubusercontent.com/chiupam/surge/main/boxjs/chiupam.boxjs.json
 * 
 * hostname: student.wozaixiaoyuan.com
 * 
 * type: http-request
 * regex: ^https?://student\.wozaixiaoyuan\.com/heat/getTodayHeatList\.json
 * script-path: https://raw.githubusercontent.com/chiupam/surge/main/Surge/KMUST.js
 * requires-body: 1 | true
 * 
 * type: cron
 * cron: 1 0 7,12,22 * * *
 * script-path: https://raw.githubusercontent.com/chiupam/surge/main/Surge/KMUST.js
 * 
 * =============== Surge ===============
 * 昆工疫情SESSION = type=http-request, pattern=^https?://student\.wozaixiaoyuan\.com/heat/getTodayHeatList\.json, requires-body=1, max-size=-1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/epidemic_kmust.js, script-update-interval=0, timeout=10
 * 昆工疫情签到 = type=cron, cronexp="1 0 7,12,22 * * *", wake-system=1, script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/epidemic_kmust.js, script-update-interval=0, timeout=10
 * 
 * =============== Loon ===============
 * http-request ^https?://student\.wozaixiaoyuan\.com/heat/getTodayHeatList\.json script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/epidemic_kmust.js, requires-body=true, timeout=10, tag=昆工疫情JWSESSION
 * cron "0 0 7,12,22 * * *" script-path=https://raw.githubusercontent.com/chiupam/surge/main/scripts/javascripts/epidemic_kmust.js, tag=昆工疫情签到
 * 
 */

const $ = new Env('🌼 昆明理工大学 🌼')
const host = `https://student.wozaixiaoyuan.com/`
const inSchool = $.read("kmust_inSchool")
const JWSESSION = $.read("kmust_JWSESSION")
const checkin_address = $.read("kmust_address") || "云南省昆明市呈贡区致远路与郎溪街交叉口"
const nowHours = new Date().getHours()
const illustrate = `微信 => 小程序 => 我在校园 => 日检日报`

typeof $request !== `undefined` ? start() : main()

function start() {
  const Method = $request.method
  if (Method == "POST" || Method == "GET") {
    if ($request.headers) {
      if (!JWSESSION) {
        $.write($request.headers.JWSESSION, "kmust_JWSESSION")
        $.notice($.name, `✅`, `首次写入 JWSESSION 成功`)
      } else if ($request.headers.JWSESSION != JWSESSION) {
        $.write($request.headers.JWSESSION, "kmust_JWSESSION")
        $.notice($.name, `✅`, `更新 JWSESSION 成功`)
      }
    } else {
      $.notice($.name, ``, `⭕ 无法读取请求头`)
    }
  }
  $.done()
}

async function main() {
  if (JWSESSION) {
    await index()
    if (inSchool == `true` && $.list != -10) {
      // state 0: 未开启 1: 开启中 2: 已结束
      // type 0: 未打卡 1: 已打卡
      if ($.list.state == 0) {
        $.log(`⭕ ${period().t}打卡未开启`)
      } else if ($.list.state == 1 && $.list.type == 1) {
        $.log(`⭕ ${period().t}已经打卡`)
      } else if ($.list.state == 2) {
        $.log(`⭕ ${period().t}打卡已经结束`)
      } else {
        await geocoding()
        if ($.latitude != 0) await task()
      }
    } else if (inSchool != `true` && $.list != -10) {
      // country 有该键的存在则为打卡成功
      if ($.list.country) {
        $.log(`⭕ 今日健康已经打卡`)
      } else {
        await geocoding()
        if ($.latitude != 0) await task()
      }
    } else {
      $.log(`❌ 我在校园JWSESSION已过期`)
    }
  } else {
    $.notice($.name, `❌ 赞无我在校园JWSESSION, 请先抓包❗`, illustrate)
    $.log(`❌ 赞无我在校园JWSESSION`)
  }
  $.done()
}

function period() {
  if (nowHours < 10) {
    i = 0, t = `晨检`
  } else if (nowHours < 15) {
    i = 1, t = `午检`
  } else {
    i = 2, t = `晚检`
  }
  return {i, t}
}

function geocoding() {
  inSchool == `true` ? name_task = period().t : name_task = `健康`
  return new Promise(resolve => {
    const options = {
      url: `${$.read("serverless_api")}KMUST`, 
      body: `address=${checkin_address}`
    }
    $.log(`${inSchool == "true" ? "🏫" : "🏠"} ${checkin_address}`)
    $.log(`🧑‍💻 正在通过地址转换出打卡封包`)
    $.post(options, (err, resp, data) => {
      try {
        if (data) {
          $.dkbody = $.toObj(data)
          $.latitude = $.dkbody.latitude
          if ($.latitude == 0) {
            $.notice($.name, `❌ ${name_task}打卡失败 ❌`, `📡 无法获取正确的打卡封包`)
            $.log(`❌ 无法获取正确的打卡封包`)
          } else {
            $.log(`✅ 获取打卡封包成功`)
            // $.log(`✅ 所在国家 --> ${$.dkbody.country}`)
            // $.log(`✅ 所在省份 --> ${$.dkbody.province}`)
            // $.log(`✅ 所在城市 --> ${$.dkbody.city}`)
            // $.log(`✅ 所在政区 --> ${$.dkbody.district}`)
            // $.log(`✅ 所在街道 --> ${$.dkbody.township}`)
            // $.log(`✅ 所在道路 --> ${$.dkbody.street}`)
            // $.log(`✅ 行政编码 --> ${$.dkbody.areacode}`)
            // $.log(`✅ 所在纬度 --> ${$.dkbody.latitude}`)
            // $.log(`✅ 所在经度 --> ${$.dkbody.longitude}`)
            $.timestampHeader = $.dkbody.timestampHeader
            $.signatureHeader = $.dkbody.signatureHeader
            $.fastbody = $.dkbody.data
          }
        } else if (err) {
          $.log(`❌ 获取打卡封包时 API 请求失败`)
          $.log(err)
        }
      } catch (e) {
        $.log(`❌ 获取打卡封包时发生错误`)
        $.log(resp)
      } finally {
        resolve()
      }
    })
  })
}

function index() {
  inSchool == `true` ? name_url = `getTodayHeatList` : name_url = `getToday`
  inSchool == `true` ? name_task = `日检日报` : name_task = `健康打卡`
  return new Promise(resolve => {
    const options = {
      url: `${host}heat/${name_url}.json`, 
      headers: {"JWSESSION": JWSESSION}
    }
    $.log(`🧑‍💻 获取当天${name_task}情况`)
    $.post(options, (err, resp , data) => {
      try {
        if (data) {
          if ($.toObj(data).code != -10) {
            $.log(`✅ 成功获取${name_task}任务`)
            $.list = $.toObj(data).data[period().i]
          } else {
            $.notice($.name, `❌ 我在校园JWSESSION已过期, 请重新抓包❗`, illustrate)
            $.list = -10
          }
        } else if (err) {
          $.log(`❌ 获取${name_task}任务列表时发生错误`)
          $.log(err)
        }
      } catch (e) {
        $.log(`❌ 访问${name_task} API 时发生错误`)
        $.log(resp)
      } finally {
        resolve()
      }
    })
  })
}

function task() {
  inSchool == `true` ? name_quantitative = `answers=["0"]&seq=${$.list.seq}&temperature=36.0&userId=&myArea=&` : name_quantitative = `answers=["0"]`
  inSchool == `true` ? name_url = `heat` : name_url = `health`
  inSchool == `true` ? name_task = period().t : name_task = `健康`
  return new Promise(resolve => {
    const options = {
      url: `${host}${name_url}/save.json`, 
      headers: {"JWSESSION": JWSESSION}, 
      body: encodeURI(name_quantitative + $.fastbody)
    }
    $.log(`🧑‍💻 信息完成组装, 开始${name_task}打卡`)
    $.post(options, (err, resp, data) => {
      try {
        if (data) {
          $.checkin = $.toObj(data)
          if ($.checkin.code == 0) {
            $.log(`✅ ${name_task}打卡成功`)
            // $.notice($.name, `✅ ${name_task}打卡成功 ✅`, ``)
          } else {
            $.log(`❌ ${name_task}打卡失败`)
            $.log($.toStr($.checkin))
            $.notice($.name, `❌ ${name_task}打卡失败 ❌`, `📡 ${$.checkin.message}`)
          }
        } else if (err) {
          $.log(`❌ 签到时 API 请求失败`)
          $.log(err)
        }
      } catch (e) {
        $.log(`❌ 签到时发生错误`)
        $.log(resp)
      } finally {
        resolve()
      }
    })
  })
}

function Env(name) {
  LN = typeof $loon != "undefined"
  SG = typeof $httpClient != "undefined" && !LN
  QX = typeof $task != "undefined"
  read = (key) => {
    if (LN || SG) return $persistentStore.read(key)
    if (QX) return $prefs.valueForKey(key)
  }
  write = (key, val) => {
    if (LN || SG) return $persistentStore.write(key, val); 
    if (QX) return $prefs.setValueForKey(key, val)
  }
  notice = (title, subtitle, message, url) => {
    if (LN) $notification.post(title, subtitle, message, url)
    if (SG) $notification.post(title, subtitle, message, { url: url })
    if (QX) $notify(title, subtitle, message, { "open-url": url })
  }
  get = (url, cb) => {
    if (LN || SG) {$httpClient.get(url, cb)}
    if (QX) {url.method = 'GET'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  post = (url, cb) => {
    if (LN || SG) {$httpClient.post(url, cb)}
    if (QX) {url.method = 'POST'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  put = (url, cb) => {
    if (LN || SG) {$httpClient.put(url, cb)}
    if (QX) {url.method = 'PUT'; $task.fetch(url).then((resp) => cb(null, {}, resp.body))}
  }
  toObj = (str) => JSON.parse(str)
  toStr = (obj) => JSON.stringify(obj)
  log = (message) => console.log(message)
  done = (value = {}) => {$done(value)}
  return { name, read, write, notice, get, post, put, toObj, toStr, log, done }
}
