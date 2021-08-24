// 加载环境变量
require('dotenv').config()
const notify = require('./sendNotify');
const express = require('express');
const got = require('got');
const path = require('path');
const QR = require('qrcode');
const bodyParser = require('body-parser');
const cors = require('cors');

let UPDATE_API = ""
if(process.env.UPDATE_API){
  UPDATE_API = process.env.UPDATE_API;
}
let API_TOKEN = ""
if(process.env.API_TOKEN){
  API_TOKEN = process.env.API_TOKEN;
}

const app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
const qs = require('querystring');
/**
 * 字符串工具函数
 * 从 'xxx=yyy' 中提取 'yyy'
 *
 * @param {*} key
 * @return {string} value
 */
const transformKey = (key) => {
  return key.substring(key.indexOf('=') + 1, key.indexOf(';'));
};

/**
 * 随机字符串
 *
 * @param {number} [length=6]
 * @return {*}
 */
const ramdomString = (length = 6) => {
  var str = 'abcdefghijklmnopqrstuvwxyz';
  str += str.toUpperCase();
  str += '0123456789';
  var _str = '';
  for (let i = 0; i < length; i++) {
    var rand = Math.floor(Math.random() * str.length);
    _str += str[rand];
  }
  return _str;
};

/**
 * 通过res获取cookie
 * 此cookie用来请求二维码
 *
 * @param {*} response
 * @return {*}
 */
const praseSetCookies = (response) => {
  const s_token = response.body.s_token;
  const guid = transformKey(response.headers['set-cookie'][0]);
  const lsid = transformKey(response.headers['set-cookie'][2]);
  const lstoken = transformKey(response.headers['set-cookie'][3]);
  const cookies = `guid=${guid}; lang=chs; lsid=${lsid}; lstoken=${lstoken};`;
  return {
    s_token,
    guid,
    lsid,
    lstoken,
    cookies,
  };
};

/**
 * 通过res解析headers获得cookie
 *
 * @param {*} response
 * @return {string} userCookie
 */
const getCookie = (response) => {
  // 注释的参数没用，如果二次修改请自行研究
  // const TrackerID = transformKey(response.headers['set-cookie'][0]);
  // const pt_token = transformKey(response.headers['set-cookie'][3]);
  // const pwdt_id = transformKey(response.headers['set-cookie'][4]);
  // const s_key = transformKey(response.headers['set-cookie'][5]);
  // const s_pin = transformKey(response.headers['set-cookie'][6]);

  const pt_key = transformKey(response.headers['set-cookie'][1]);
  const pt_pin = transformKey(response.headers['set-cookie'][2]);
  const userCookie = `pt_key=${pt_key};pt_pin=${pt_pin};`;
  console.log({
    msg: '登录成功',
    time: new Date().toLocaleString('chinese', {
      hour12: false
    }),
    userCookie,
    pt_pin,
  });
  return userCookie;
};

const LOGIN_UA = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5 UCBrowser/13.4.2.1122";


/**
 * 初始化请求二维码的参数
 *
 */
async function step1() {
  const timeStamp = new Date().getTime();
  const loginUrl =
    'https://plogin.m.jd.com/cgi-bin/mm/new_login_entrance?lang=chs&appid=300' +
    `&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${timeStamp}` +
    '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport';

  const response = await got(loginUrl, {
    responseType: 'json',
    headers: {
      Connection: 'Keep-Alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'zh-cn',

      Referer: 'https://plogin.m.jd.com/login/login?appid=300' +
        `&returnurl=https://wq.jd.com/passport/LoginRedirect?state=${timeStamp}` +
        '&returnurl=https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
      'User-Agent': LOGIN_UA,
      Host: 'plogin.m.jd.com',
    },
  });

  return praseSetCookies(response);
}

/**
 * 获取二维码链接
 *
 * @param {*} cookiesObj
 * @return {*}
 */
async function step2(cookiesObj) {
  const {
    s_token,
    guid,
    lsid,
    lstoken,
    cookies
  } = cookiesObj;
  if (cookies == '') {
    throw new Error('获取失败');
  }
  const timeStamp = new Date().getTime();
  const getQRUrl =
    'https://plogin.m.jd.com/cgi-bin/m/tmauthreflogurl?s_token=' +
    `${s_token}&v=${timeStamp}&remember=true`;
  const response = await got.post(getQRUrl, {
    responseType: 'json',
    json: {
      lang: 'chs',
      appid: 300,
      returnurl: `https://wqlogin2.jd.com/passport/LoginRedirect?state=${timeStamp}` +
        '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
      source: 'wq_passport',
    },
    headers: {
      'Client-IP': '0.0.0.0',
      Connection: 'Keep-Alive',
      'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
      Accept: 'application/json, text/plain, */*',
      'X-Forwarded-For': '0.0.0.0',
      Cookie: cookies,
      Referer: 'https://plogin.m.jd.com/login/login?appid=300' +
        `&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${timeStamp}` +
        '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
      'User-Agent': LOGIN_UA,
      Host: 'plogin.m.jd.com',
    },
  });
  const token = response.body.token;
  console.log(response.body);
  const oneKeyLog = response.body['onekeylog_url'];

  const okl_token = transformKey(response.headers['set-cookie'][0]);
  const qrCodeUrl = `https://plogin.m.jd.com/cgi-bin/m/tmauth?appid=300&client_type=m&token=${token}`;
  return {
    ...cookiesObj,
    qrCodeUrl,
    oneKeyLog,
    okl_token,
    token,
    cookies: `okl_token=${okl_token};` + cookies,
  };
}

/**
 * 通过前端传回的参数获得cookie
 *
 * @param {*} user
 * @return {*}
 */
async function checkLogin(user) {
  const {
    s_token,
    guid,
    lsid,
    lstoken,
    cookies,
    okl_token,
    token
  } = user;
  const timeStamp = new Date().getTime();
  const getUserCookieUrl =
    `https://plogin.m.jd.com/cgi-bin/m/tmauthchecktoken?&token=${token}` +
    `&ou_state=1&okl_token=${okl_token}`;
  const response = await got.post(getUserCookieUrl, {
    responseType: 'json',
    body: qs.stringify({
      lang: 'chs',
      appid: 300,
      returnurl: 'https://wqlogin2.jd.com/passport/LoginRedirect?state=1100399130787&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action',
      source: 'wq_passport',
    }),
    headers: {
      'Client-IP': '0.0.0.0',
      'X-Forwarded-For': '0.0.0.0',
      Referer: 'https://plogin.m.jd.com/login/login?appid=300' +
        `&returnurl=https://wqlogin2.jd.com/passport/LoginRedirect?state=${timeStamp}` +
        '&returnurl=//home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&/myJd/home.action&source=wq_passport',
      Cookie: cookies,
      Connection: 'Keep-Alive',
      'Content-Type': 'application/x-www-form-urlencoded; Charset=UTF-8',
      Accept: 'application/json, text/plain, */*',
      'User-Agent': LOGIN_UA
    },
  });
  return response;
}
/**
 * 自动更新服务
 *
 * @param {*} ucookie
 * @return {string} msg
 *
 */
async function updateCookie(cookie, userMsg) {
  let msg = '';
  if (UPDATE_API) {
    try {
      if (UPDATE_API.split('|').length > 1) {
        const updateHosts = UPDATE_API.split('|');
        let apiTokens = [];
        if(API_TOKEN){
          apiTokens = API_TOKEN.split('|');
        }
        if(apiTokens.length !== updateHosts.length){
          return 'UPDATE_API数量与API_TOKEN数量不一致';
        }
        let hostIndex = 1;
        for await (const updateUrl of updateHosts) {
          console.log(updateUrl);
          try {
            const res = await got.extend({
              headers: {
                "api-token": apiTokens[hostIndex - 1] || ''
              },
            }).post({
              url: updateUrl,
              json: {
                cookie,
                userMsg,
                defaultStatus: false,
                defaultName: userMsg,
                defaultWeight: 1,
              },
              timeout: 10000,
            });
            console.log(res.body);
            msg += `服务器${hostIndex}:${JSON.parse(res.body).msg}\n`;
          } catch (error) {
            msg += `服务器${hostIndex}:更新失败\n`;
          }
          hostIndex += 1;
        }
        return msg;
      } else if (UPDATE_API.startsWith('http')) {
        const res = await got.extend({
          headers: {
            "api-token": API_TOKEN || ''
          },
        }).post({
          url: UPDATE_API,
          json: {
            cookie,
            userMsg,
            defaultStatus: false,
            defaultName: userMsg,
            defaultWeight: 1,
          },
          timeout: 10000,
        });
        msg += JSON.parse(res.body).msg;
        return msg;
      } else {
        return '更新地址配置错误';
      }
    } catch (err) {
      // console.log(err);
      console.log({
        msg: 'Cookie 更新接口错误',
      });
      return '';
    }
  }
  return '';
}

/**
 * 对ck进行处理的流程
 *
 * @param {*} cookie
 * @return {*}
 */
async function cookieFlow(cookie, userMsg) {
  try {
    const updateMsg = await updateCookie(cookie, userMsg);
    await notify.sendNotify('====获取到cookie====', `${updateMsg} \n用户备注：${userMsg}\n${cookie}`, params = {
      url: 'https://hub.docker.com/r/supermanito/helloworld'
    }, author = '\n本通知 By：helloworld for Dockerhub');
    return msg;
  } catch (err) {
    return '';
  }
}

/**
 * API 获取二维码链接
 */
app.get('/qrcode', async function (request, response) {
  try {
    const cookiesObj = await step1();
    const user = await step2(cookiesObj);
    const qrCodeImg = await QR.toDataURL(user.qrCodeUrl, {
      margin: 0,
      width: 300,
      scale: 0,
      //color: {
      //  dark: '#0000',
      //  light: '#000000' // Transparent background dark #0000 light #000000
      //}
    });
    response.send({
      err: 0,
      qrCodeUrl: user.qrCodeUrl,
      oneKeyLog: user.oneKeyLog,
      qrCodeImg,
      user,
    });
  } catch (err) {
    response.send({
      err: 2,
      msg: '错误'
    });
  }
});

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * API 获取返回的cookie信息
 */
app.post('/cookie', async function (request, response) {
  const user = request.body.user;
  const userMsg = request.body.msg;
  if (user && user.cookies != '') {
    (async () => {
      try {
        const cookie = await checkLogin(user);
        if (cookie.body.errcode == 0) {
          let ucookie = getCookie(cookie);
          await cookieFlow(ucookie, userMsg);
          response.send({
            err: 0,
            cookie: ucookie,
            msg: '更新成功'
          });
        } else {
          response.send({
            err: cookie.body.errcode,
            msg: cookie.body.message,
            body: cookie.body,
          });
        }
      } catch (err) {
        response.send({
          err: 1,
          msg: err
        });
      }
    })();
  } else {
    response.send({
      err: 2,
      msg: '获取失败'
    });
  }
});

// 本地运行开启以下
const PORT = 6789;
app.listen(PORT, () => {
  console.log(`应用正在监听 ${PORT} 端口!`);
  console.log(`UPDATE_API ==> ${UPDATE_API}`);
  console.log(`API_TOKEN ==> ${API_TOKEN}`);
});
// 云函数运行开启以下
module.exports = app;
