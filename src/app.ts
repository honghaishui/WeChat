/*
 * @Author: honghaishui hhssdsz@163.com
 * @Date: 2022-08-09 14:28:38
 * @LastEditors: honghaishui hhssdsz@163.com
 * @LastEditTime: 2022-08-16 14:36:07
 * @FilePath: \back_end\src\app.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// src/app.ts

import express from "express";
import {
  routes,
  send,
  getWeather,
  getJoke,
  getSaylove,
  getLoveDay,
  getWages,
  getLoveAnniversary,
} from "./routes"; // 路由
import logger from "./utils/logger";
const schedule = require("node-schedule");
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
const scheduleCronstyle = () => {
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob("00 * * * * *", () => {
    createData();
  });
};
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
scheduleCronstyle();
const app = express();

app.use(express.json());

const PORT = 80;

// 启动
app.listen(PORT, async () => {
  logger.info(`App is running at http://localhost:${PORT}`);
  routes(app);
});
