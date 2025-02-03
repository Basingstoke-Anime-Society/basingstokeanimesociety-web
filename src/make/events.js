const util = require('./util.js');

const _ = require('lodash');

const venueAddress = {
  '': '',
  'The White Hart': 'London Road, Basingstoke RG21 4AE',
  'The Tea Bar': '9 London Rd, Basingstoke RG21 7NT',
};

const MONDAY = 1;
const TUESDAY = 2;

function expandEventDate(date, time) {
  return {
    date: date,
    dateLong: util.formatLongDate(date) + ", " + time,
    mediumDate: util.formatMediumDate(date),
    shortDate: util.formatShortDate(date),
    time: time,
    weekday: util.weekday(date),
    shortWeekday: util.shortWeekday(date),
    day: date.getDate(),
    month: util.formatShortMonth(date),
    year: util.formatYear(date),
  }
}

function tuesdayEvents(skipDates) {
  // add in the tuesday events
  let tuesday = new Date(Date.now());
  let dow = TUESDAY - tuesday.getDay();
  if (dow < 0) dow += 7;
  tuesday.setDate(tuesday.getDate() + dow);
  tuesday.setHours(19);
  tuesday.setMinutes(0);
  tuesday.setSeconds(0);
  tuesday.setMilliseconds(0);

  let events = [];

  for (var i = 0; i < 50; i++) {
    let date = new Date(tuesday);
    date.setDate(date.getDate() + i*7);

    let online = false;

    let event = {
      ...expandEventDate(date, "7pm"),
      name: online ? 'Online Meeting' : 'Anime Night',
      class: online ? 'online' : 'anime',
      price: online ? null : "&pound;4",
      venue: online ? 'Discord' : 'The White Hart',
      address: online ? '' : venueAddress['The White Hart']
    }
    if (_.has(skipDates, event.shortDate)) {
      console.log("Skipping event:", event.shortDate);
      continue;
    }
    events.push(event);
  }

  return events;
}

function nostalgiaMondayEvents(skipDates) {
  let monday = new Date(Date.now());
  let dow = MONDAY - monday.getDay();
  if (dow < 0) dow += 7;
  monday.setDate(monday.getDate() + dow);
  monday.setHours(19);
  monday.setMinutes(0);
  monday.setSeconds(0);
  monday.setMilliseconds(0);

  let events = [];

  for (var i = 0; i < 50; i++) {
    let date = new Date(monday);
    date.setDate(date.getDate() + i*7);

    let event = {
      ...expandEventDate(date, "7pm"),
      name: 'Nostalgia Monday',
      class: 'online',
      venue: 'Discord',
      address: '',
      hide: true,
    }
    if (_.has(skipDates, event.shortDate)) {
      console.log("Skipping event:", event.shortDate);
      continue;
    }
    events.push(event);
  }

  return events;
}

module.exports = {
  venueAddress,
  expandEventDate,
  tuesdayEvents,
  nostalgiaMondayEvents,
}
