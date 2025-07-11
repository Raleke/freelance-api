const moment = require("moment");

//  Detect overlap
const isOverlapping = (slots) => {
  const sorted = slots.sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].end) return true;
  }
  return false;
};

//  Generate recurring days between range
const generateRecurringDays = (startDate, repeatUntil, daysOfWeek) => {
  const result = [];
  let current = moment(startDate);

  while (current.isSameOrBefore(moment(repeatUntil))) {
    if (daysOfWeek.includes(current.format("dddd"))) {
      result.push(current.format("YYYY-MM-DD"));
    }
    current.add(1, "day");
  }

  return result;
};

module.exports = { isOverlapping, generateRecurringDays };