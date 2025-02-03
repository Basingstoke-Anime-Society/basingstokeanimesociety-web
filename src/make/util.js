const crypto = require('crypto');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');


// read in the combined 
function readData() {
  var files = fs.readdirSync("data", { withFileTypes: true });

  let basData = {};
  _.each(files, file => {
    let fileData = fs.readFileSync('data/'+file.name);
    let loadData = yaml.safeLoad(fileData);
    basData = {...basData, ...loadData};
  });

  basData = {
    ...basData,
    maxEvents: 24,
    windowEvents: 40,
    maxTweets: 10,
  };

  return basData;
}


// date formats

let yearFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric' });
function formatYear(date) {
  return yearFormat.format(date);
}

let shortMonthFormat = new Intl.DateTimeFormat('en-GB', { month: 'short' });
function formatShortMonth(date) {
  return shortMonthFormat.format(date);
}

function padNumber(num, digits) {
  num = '0'.repeat(digits)+num;
  num = num.substr(num.length - digits);
  return num;
}

let dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric' });
function formatDay(date) {
  let parts = _.keyBy(dayFormat.formatToParts(date), 'type');
  return ""+parts.day.value;
}

let shortDateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric' });
function formatShortDate(date) {
  try {
    let parts = _.keyBy(shortDateFormat.formatToParts(date), 'type');
    return ""+parts.year.value+"-"+padNumber(parts.month.value, 2)+"-"+padNumber(parts.day.value, 2);
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

let mediumDateFormat = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
function formatMediumDate(date) {
  try {
    let parts = _.keyBy(mediumDateFormat.formatToParts(date), 'type');
    return ""+parts.day.value+" "+parts.month.value+" "+parts.year.value;
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

let longDateFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
function formatLongDate(date) {
  try {
    let parts = _.keyBy(longDateFormat.formatToParts(date), 'type');
    return ""+parts.weekday.value+", "+parts.day.value+" "+parts.month.value+" "+parts.year.value;
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

let lastModifiedFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
function formatLastModified(date) {
  try {
    // Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
    let parts = _.keyBy(lastModifiedFormat.formatToParts(date), 'type');
    return ""+parts.weekday.value+", "+parts.day.value+" "+parts.month.value+" "+parts.year.value
      +" "+padNumber(parts.hour.value, 2)+":"+padNumber(parts.minute.value, 2)+":00 GMT";
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

let weekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
function weekday(date) {
  try {
    let parts = _.keyBy(weekdayFormat.formatToParts(date), 'type');
    return parts.weekday.value;
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

let shortWeekdayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
function shortWeekday(date) {
  try {
    let parts = _.keyBy(shortWeekdayFormat.formatToParts(date), 'type');
    return parts.weekday.value;
  } catch(err) {
    console.error("Bad date", date);
    console.error(err);
    return "";
  }
}

function formatShortTime(time) {
  return time;
}

// date arrangmeent
let now = new Date(Date.now());
console.log("Today:           ", formatShortDate(now));

// find all future items, as well as
function currentAndFuture(items, key = 'date', requireName = true) {
  items = _.sortBy(items, key);
  if (requireName) {
    items = _.filter(items, item => _.has(item, "name"));
  }

  let [before, after] = _.partition(items, item => item[key] < now);
  let current = before[before.length - 1];
  if (current !== undefined) {
    after.unshift(current);
  }
  return after;
}

function recentAndFuture(items, key = 'date', requireName = true) {
  items = _.sortBy(items, key);
  if (requireName) {
    items = _.filter(items, item => _.has(item, "name"));
  }

  let cutoff = recentDateCutoff();
  let [before, after] = _.partition(items, item => item[key] < cutoff);
  let current = before[before.length - 1];
  if (current !== undefined) {
    after.unshift(current);
  }
  return after;
}

function futureN(items, number, key = 'date', requireName = true) {
  items = _.sortBy(items, key);
  if (requireName) {
    items = _.filter(items, item => _.has(item, "name"));
  }

  items = _.filter(items, item => item[key] > now);
  items = items.slice(0, number);
  if (key != 'date') {
    _.each(items, item => item.date = item[key]);
  }
  return items;
}

function future(items, key = 'date', requireName = true) {
  return futureN(items, 100, key, requireName);
}

function tomorrow() {
  let date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

function yesterday() {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

function plus1week(from) {
  let date = new Date(from);
  date.setDate(date.getDate() + 7);
  return date;
}

function recentDateCutoff() {
  let date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

function firstTuesdayFrom(date) {
  while (date.getDay() != 2) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function backdate(items, key = 'from') {
  return _.map(items, item => {
    if (!_.has(item, key)) {
      return item;
    }

    let date = new Date(item[key]);
    date.setTime(item[key].getTime());
    date.setDate(date.getDate() - 7);
    date.setHours(22);
    date.setMinutes(0);

    item = _.clone(item);
    item[key] = date;

    return item;
  });
}

function expandDate(target, date = null, time = null, leeway = 0) {
  if (date === null) {
    date = target.date;
  }
  if (time !== null) {
    time = time.trim();
    let pm = true;
    if (time.match(/pm$/)) {
      time = time.replace(/pm$/, '');
    } else if (time.match(/am$/)) {
      pm = false;
      time = time.replace(/am$/, '');
    }
    time = parseInt(time) + leeway;
    date.setHours(time + (pm ? 12 : 0));
    target.date = date;
  }

  target.day = date.getDate();
  target.month = formatShortMonth(date);
  target.weekday = weekday(date);
  target.year = formatYear(date);
  return target;
}

function md5sum(data, digits = 6) {
  let hash = crypto.createHash('md5').update(data).digest("hex");
  return hash.substr(0, digits);
}

function slugify(value) {
  value = value.toLowerCase();
  value = value.replaceAll(/[^a-z0-9]+/g, '-');
  value = value.replace(/-$/, '');
  value = value.replace(/^-/, '');
  return value;
}

module.exports = {
  readData,
  formatDay,
  formatYear,
  formatShortMonth,
  formatShortDate,
  formatMediumDate,
  formatLongDate,
  formatShortTime,
  formatLastModified,
  weekday,
  shortWeekday,
  currentAndFuture,
  recentAndFuture,
  futureN,
  future,
  tomorrow,
  yesterday,
  plus1week,
  recentDateCutoff,
  firstTuesdayFrom,
  backdate,
  expandDate,
  md5sum,
  slugify,
};
