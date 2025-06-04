import fetch from 'node-fetch';

/**
 * @typedef {object} HolidayItem
 * @property {string} name 节日名称
 * @property {string} date 节日日期
 * @property {boolean} isOffDay 是否为休息日
 */

/**
 * 获取中国国务院节假日安排
 * @param {number} year
 * @returns {Promise<HolidayItem[]>}
 */
export const getCnHolidayList = async (year) => {
  return await fetch(
    `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`,
  )
    .then((res) => res.json())
    .then((res) => res.days);
};
