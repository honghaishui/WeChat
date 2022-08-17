/*
 * @Author: honghaishui hhssdsz@163.com
 * @Date: 2022-08-09 14:31:53
 * @LastEditors: honghaishui hhssdsz@163.com
 * @LastEditTime: 2022-08-11 15:31:17
 * @FilePath: \back_end\src\utils\logger.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// logger.ts

import pino from "pino";
import dayjs from "dayjs";

const log = pino({
  transport: {
    // pino 7.x的写法有所不同
    target: "pino-pretty",
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD HH:mm:ss")}"`,
});

export default log;
