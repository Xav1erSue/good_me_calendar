import dayjs from 'dayjs';
import fs from 'fs';
import ics from 'ics';
import 'dayjs/locale/zh-cn.js';
import weekday from 'dayjs/plugin/weekday.js';
import { getCnHolidayList } from './get-holiday.js';
import path from 'path';

dayjs.locale('zh-cn');
dayjs.extend(weekday);

/**
 * 生成指定年份的日历
 * @param {number} year 年份
 */
export const getCalendar = async (year) => {
  const holidayList = await getCnHolidayList(year);

  /**
   * @type {ics.EventAttributes[]}
   */
  const events = [];

  /* -------------------------------- 生成周六加班日历 -------------------------------- */

  // 遍历 12 个月
  for (let month = 0; month < 12; month++) {
    // 从每个月第一天开始，遍历每个月的天数
    for (let day = 1; day <= dayjs().month(month).daysInMonth(); day++) {
      const date = dayjs().month(month).date(day);

      const holiday = holidayList.find((item) => {
        return dayjs(item.date, 'YYYY-MM-DD').isSame(date, 'day');
      });

      // 周末，且非节假日，计入当周
      // 周末，且节假日，不计入当周
      // 非周末，且节假日，计入当周
      // 非周末，且非节假日，计入当周

      if (date.weekday() > 4 && holiday && holiday.isOffDay) {
        continue;
      }

      const workDay = date.add(2, 'week').weekday(5);

      events.push({
        title: '工作日',
        start: [year, month + 1, workDay.date()],
        status: 'CONFIRMED',
      });

      break;
    }
  }

  /* --------------------------------- 生成发薪日历 --------------------------------- */

  // 遍历 12 个月
  for (let month = 0; month < 12; month++) {
    // 每月 15 号是默认发薪日
    const defaultPayDay = dayjs().month(month).date(15);
    const weekday = defaultPayDay.weekday();
    // 如果 15 号是周末，发薪日是上一个工作日
    const payday = weekday > 4 ? defaultPayDay.weekday(4) : defaultPayDay;

    events.push({
      title: '发薪日',
      start: [year, month + 1, payday.date()],
      status: 'CONFIRMED',
    });
  }

  const { error, value } = ics.createEvents(events);

  if (error) {
    console.error(error);
  }
  if (value) {
    const filePath = path.join(process.cwd(), `./${year}.ics`);
    fs.writeFileSync(filePath, value);
  }
};
