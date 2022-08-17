/*
 * @Author: honghaishui hhssdsz@163.com
 * @Date: 2022-08-09 14:29:11
 * @LastEditors: error: git config user.name && git config user.email & please set dead value or install git
 * @LastEditTime: 2022-08-17 19:35:49
 * @FilePath: \back_end\src\routes\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// src/routes/index.ts

import { Express, Request, Response, Router } from "express";
import dayjs from "dayjs";
import crypto from "crypto";
import logger from "../utils/logger";

import axios from "axios";
// 路由配置接口
interface RouterConf {
  path: string;
  router: Router;
  meta?: unknown;
}
interface MessageType {
  date: string;
  loveDay: number;
  // 工资
  wages: number;
  // 恋爱纪念日
  loveAnniversary: number;
  // 天气
  textDay: string;
  temp: number;
  high: number;
  low: number;
  joke: string;
  sayLove: string;
}
// 路由配置
const routerConf: Array<RouterConf> = [];

function routes(app: Express) {
  // 根目录
  app.get("/", (req: Request, res: Response) => {
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    var signature = req.query.signature, //微信加密签名
      timestamp = req.query.timestamp, //时间戳
      nonce = req.query.nonce, //随机数
      echostr = req.query.echostr; //随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = ["haishui", timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join("");
    const hashCode = crypto.createHash("sha1"); //创建加密类型
    var resultCode = hashCode.update(tempStr, "utf8").digest("hex"); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
      res.send(echostr);
    } else {
      res.send("mismatch");
    }
  });
  app.get("/sendMsg", (req: Request, res: Response) => {
    createData();
    res.status(200).send("send success");
  });
  routerConf.forEach((conf) => app.use(conf.path, conf.router));
}
async function createData() {
  let weatherData = await getWeather();
  const { date, week, text_day, high, low, temp } = weatherData;
  const joke = await getJoke();
  const sayLove = await getSaylove();
  const data: MessageType = {
    date: `${date} ${week}`,
    loveDay: getLoveDay(),
    // 工资
    wages: getWages(),
    // 恋爱纪念日
    loveAnniversary: getLoveAnniversary(),
    // 天气
    textDay: text_day,
    temp: temp,
    high: high,
    low: low,
    joke,
    sayLove,
  };
  send(data);
}
async function getToken() {
  const res = await axios.get(
    "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=&secret="
  );
  return res.data.access_token;
}
async function send(data: MessageType) {
  const token = await getToken();
  const {
    date,
    loveDay,
    wages,
    loveAnniversary,
    textDay,
    high,
    low,
    temp,
    joke,
    sayLove,
  } = data;
  const res = await axios({
    url: `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`,
    method: "POST",
    data: {
      touser: "",
      template_id: "",
      data: {
        date: {
          value: date,
          color: "#EFB1C7",
        },
        loveDay: {
          value: loveDay,
          color: "#CF948E",
        },
        // 工资
        wages: {
          value: wages,
          color: "#246B69",
        },
        // 恋爱纪念日
        loveAnniversary: {
          value: loveAnniversary,
          color: "#D9BCD6",
        },
        // 天气
        textDay: {
          value: textDay,
          color: "#84C9EF",
        },
        temp: {
          value: temp,
          color: "#A6C4D0",
        },
        high: {
          value: high,
          color: "#A6C4D0",
        },
        low: {
          value: low,
          color: "#A6C4D0",
        },
        joke: {
          value: joke,
          color: "#8FA678",
        },
        sayLove: {
          value: sayLove,
          color: "#C36D78",
        },
      },
    },
  });
  logger.info("success");
}
async function getWeather() {
  const res = await axios.get(
    "https://api.map.baidu.com/weather/v1/?district_id=210112&data_type=all&ak=vzWnmKvi1Ux0N5FK5hvrqpCW2CrGSQ8k"
  );
  let obj = {
    temp: res.data.result.now.temp,
    ...res.data.result.forecasts[0],
  };
  return obj;
}
async function getJoke() {
  const res = await axios({
    url: "http://api.tianapi.com/joke/index",
    params: {
      key: "你的key",
      num: 1,
    },
  });
  return res.data.newslist[0].content;
}
async function getSaylove() {
  const res = await axios({
    url: "http://api.tianapi.com/saylove/index",
    params: {
      key: "你的key",
    },
  });

  return res.data.newslist[0].content;
}
function getLoveDay() {
  return dayjs(dayjs().format("YYYY-MM-DD")).diff(dayjs("2014-03-20"), "day");
}
function getWages() {
  let year = dayjs().year();
  let month = dayjs().month() + 1;
  let dayDiff = dayjs(dayjs().format("YYYY-MM-DD")).diff(
    dayjs(`${year}-${getMonth(month)}-15`),
    "day"
  );
  if (dayDiff > 0) {
    dayDiff = dayjs(dayjs().format("YYYY-MM-DD")).diff(
      dayjs(`${year}-${getMonth(month + 1)}-15`),
      "day"
    );
  }
  dayDiff = Math.abs(dayDiff);
  return dayDiff;
}
function getMonth(month: number) {
  return month > 10 ? `${month}` : `0${month}`;
}
function getLoveAnniversary() {
  let year = dayjs().year();
  let dayDiff = dayjs(dayjs().format("YYYY-MM-DD")).diff(
    dayjs(`${year}-03-20`),
    "day"
  );
  if (dayDiff > 0) {
    dayDiff = dayjs(dayjs().format("YYYY-MM-DD")).diff(
      dayjs(`${year + 1}-03-20`),
      "day"
    );
  }
  dayDiff = Math.abs(dayDiff);
  return dayDiff;
}

export {
  routes,
  send,
  getWeather,
  getJoke,
  getSaylove,
  getLoveDay,
  getWages,
  getLoveAnniversary,
};
