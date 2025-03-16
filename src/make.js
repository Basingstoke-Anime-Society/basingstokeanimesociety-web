const fs = require('fs');

const Handlebars = require('handlebars');
const yaml = require('js-yaml');
const sass = require('node-sass');
const _ = require('lodash');

const util = require('./make/util.js');
const video = require('./make/video.js');
const episodes = require('./make/episodes.js');
const _events = require('./make/events.js');

// partials
fs.readdir('./www/js', {encoding: 'utf8'}, (err, files) => {
  if (err) {
    console.log("Error reading partials dir:", err);
    return;
  }
  // console.log("JS partials", files);

  for (let file of files) {
    fs.readFile('./www/js/'+file, 'utf8', (err, data) => {
      if (err) {
        console.log("Error reading partial "+file+":", err);
        return;
      }

      let name = file.replace('.js.h', '_js');
      // console.log("Registering partial", name);
      Handlebars.registerPartial(name, data);
    });
  }
});

fs.readdir('./www/partials', {encoding: 'utf8'}, (err, files) => {
  if (err) {
    console.log("Error reading partials dir:", err);
    return;
  }
  // console.log("Partials", files);

  for (let file of files) {
    fs.readFile('./www/partials/'+file, 'utf8', (err, data) => {
      if (err) {
        console.log("Error reading partial "+file+":", err);
        return;
      }

      let name = file.replace('.html.h', '').replace(/-/g, '_');
      // console.log("Registering partial", name);
      Handlebars.registerPartial(name, data);
    });
  }
});

Handlebars.registerHelper('eq', function(value1, value2, options) {
  return value1 == value2;
});
Handlebars.registerHelper('json', function (obj) {
  return JSON.stringify(obj);
});
Handlebars.registerHelper('inc', function(value, options) {
  return parseInt(value) + 1;
});
Handlebars.registerHelper('slug', function(value) {
  return util.slugify(value);
});
Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 1; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});

// read the data
let basData = util.readData();
let options = basData.options;
basData.lastModified = util.formatLastModified(new Date());

// combine the full list of past and future shows
let all_anime = [
  // ...basData.past_anime,
  ...basData.slot1,
  ...basData.slot2,
  ...basData.slot3,
].map(series => util.expandDate(series, series.from, '7pm'));
all_anime = all_anime.sort((a, b) => a.date - b.date);
basData.all_anime = all_anime;

// put together the list of episodes for recent-and-future shows
let skipWeeks = basData.events.filter((event) => event.class == 'skip');
skipWeeks = util.recentAndFuture(skipWeeks, 'date', false);
skipWeeks = skipWeeks.map((event) => util.formatShortDate(event.date));
console.log("Skip weeks:", skipWeeks);

basData.schedule = episodes.makeEpisodeList(basData.slot1, basData.slot2, basData.slot3, skipWeeks);

basData.historyYears = [];
let currentYear = util.formatYear(new Date());
for (let year = currentYear; year >= 2020; year--) {
  basData.historyYears.push(""+year);
}
for (let group of basData.ancient_history) {
  for (let anime of group.anime) {
    if (!anime.hasOwnProperty('picture')) {
      anime.picture = util.slugify(anime.name);
    }
  }
}


// showing anime
basData.slot1 = util.currentAndFuture(basData.slot1.map(series => util.expandDate(series, series.from, '7pm')), 'from');
console.log("Slot 1:", basData.slot1.map(series => util.formatShortDate(series.from)).join(", "));
basData.slot1back = util.backdate(basData.slot1);
basData.series1 = _.isEmpty(basData.slot1) ? { name: '', picture: '' } : basData.slot1[0];
basData.nextSeries1 = _.isEmpty(basData.slot1) ? { name: '', picture: '' } : basData.slot1[1];

basData.slot2 = util.currentAndFuture(basData.slot2.map(series => util.expandDate(series, series.from, '8pm')), 'from');
console.log("Slot 2:", basData.slot2.map(series => util.formatShortDate(series.from)).join(", "));
basData.slot2back = util.backdate(basData.slot2);
basData.series2 = _.isEmpty(basData.slot2) ? { name: '', picture: '' } : basData.slot2[0];
basData.nextSeries2 = _.isEmpty(basData.slot2) ? { name: '', picture: '' } : basData.slot2[1];

basData.slot3 = util.currentAndFuture(basData.slot3.map(series => util.expandDate(series, series.from, '9pm')), 'from');
console.log("Slot 3:", basData.slot3.map(series => util.formatShortDate(series.from)).join(", "));
basData.slot3back = util.backdate(basData.slot3);
basData.series3 = _.isEmpty(basData.slot3) ? { name: '', picture: '' } : basData.slot3[0];
basData.nextSeries3 = _.isEmpty(basData.slot3) ? { name: '', picture: '' } : basData.slot3[1];

basData.movies = util.futureN(basData.movies.map(movie => util.expandDate(movie, movie.date, movie.time, 1)), 10, 'date');
_.each(basData.movies, movie => movie.movie = true);
basData.listedMovies = util.futureN(basData.movies, 2, 'date');
console.log("Movies:", basData.movies.map(movie => util.formatShortDate(movie.date)).join(", "));


let comingSoon = [
  ...util.future(basData.slot1, 'from'),
  ...util.future(basData.slot2, 'from'),
  ...util.future(basData.slot3, 'from'),
  ...util.future(basData.movies, 'date')];
comingSoon = util.future(comingSoon);
basData.comingSoon = comingSoon;
console.log("Coming Soon:", comingSoon.map(item => item.name+" "+util.formatShortDate(item.date)).join(", "));

// copy the images for the series
_.each([basData.slot1, basData.slot2, basData.slot3, basData.movies], slot => {
  _.each(slot, series => {
    if (fs.existsSync('series/'+series.picture+'.png')) {
      fs.copyFile('series/'+series.picture+'.png', '../dist/images/series/'+series.picture+'.png', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
});

_.each(basData.events, (event) => {
  if (event.picture !== undefined && fs.existsSync('series/'+event.picture+'.png')) {
    fs.copyFile('series/'+event.picture+'.png', '../dist/images/series/'+event.picture+'.png', (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
});


// news
_.each(basData.news, article => {
  article.day = article.date.getDate();
  article.month = util.formatShortMonth(article.date);
  article.year = util.formatYear(article.date);
});
basData.news = _.sortBy(basData.news, 'date').reverse();
basData.freshNews = _.take(basData.news, basData.options.newsCutoff);
basData.staleNews = basData.news.slice(basData.options.newsCutoff, 20);

// future events
let now = new Date(Date.now());
console.log("Today:           ", util.formatShortDate(now));
console.log("Yesterday:       ", util.formatShortDate(util.yesterday()));
let events = _.filter(basData.events, event => event.date >= util.yesterday());
let skipDates = [];
events = _.map(events, event => {
  event = _.defaults(event, {
    time: ''
  });
  event = _.defaults(event, {
    class: 'social',
    ..._events.expandEventDate(event.date),
    special: event.class == 'cinema',
  });
  let venue = "";
  switch(event.class) {
    case 'social':
      venue = options.online ? 'Discord' : 'The White Hart';
      break;
    case 'skip':
      skipDates[event.shortDate] = true;
      break;
    default:
      venue = "";
      break;
  }
  return _.defaults(event, {
    venue: venue,
    address: _events.venueAddress[venue],
  })
});
console.log("Skip dates:", skipDates);

// add in events for the new series starting
_.each([basData.slot1, basData.slot2, basData.slot3], (slot, i) => {
  _.each(slot, series => {
    if (_.has(series, "name")) {
      let hide = _.has(series, "hide") ? series.hide : false;
      let date = new Date(series.from);

      if (date > now && !hide) {
        // console.log("Series date", date);
        let hour = 7+i;
        date.setHours(hour+12)
        date.setMinutes(5)
        let movie = _.has(series, "movie") ? series.movie : false;

        let event = {
          ..._events.expandEventDate(date, hour+"pm"),
          prename: (movie ? 'Movie' : 'New series'),
          name: series.name,
          picture: series.picture,
          class: 'new-series'
        }
        events.push(event);
      }
    }
  });
});

_.each(basData.movies, movie => {
  if (_.has(movie, "name")) {
    let hide = _.has(movie, "hide") ? movie.hide : false;
    let date = new Date(movie.date);
    let time = _.has(movie, "time") ? movie.time : "7pm";

    if (date > now && !hide) {
      let event = {
        ..._events.expandEventDate(date, time),
        name: 'Movie: '+movie.name,
        class: 'movie',
        venue: movie.venue
      };
      events.push(event);
    }
  }
});

// add in the regular events
events = [
  ...events,
  ..._events.tuesdayEvents(skipDates),
  ..._events.nostalgiaMondayEvents(skipDates),
];

// sort the events by date and cut to the forseeable window
events = _.sortBy(events, 'date');

basData.events = events.slice(0, basData.windowEvents);
basData.allEvents = events;

// group the events by date, summarising class
basData.eventsByDate = _(events).groupBy(e => util.formatShortDate(e.date)).map((evs, grp) => {
  // evs = evs.filter((evt) => !evt.hide);
  // if (evs.length == 0) {
  //   return null;
  // }

  let cls = evs[0].class;
  // switch colours on days with new series
  // if (cls == 'anime') {
  //   for (let ev of evs) {
  //     if (ev.hasOwnProperty('class') && ev.cls != "") {
  //       if (ev.class != 'online' && ev.class != 'anime') {
  //         cls = ev.class;
  //       }
  //     }
  //   }
  // }
  let special = false;
  let hide = true;
  for (let ev of evs) {
    if (ev.special) {
      special = true;
    }
    if (!ev.hide) {
      hide = false;
    }
  }
  
  return {
    date: evs[0].date,
    shortDate: grp,
    month: evs[0].month,
    day: evs[0].day,
    weekday: evs[0].weekday,
    year: evs[0].year,
    class: cls,
    events: evs,
    special: special,
    hide: hide
  };
}).values().sortBy('shortDate').value().slice(0, basData.windowEvents);
// console.log(JSON.stringify(basData.eventsByDate, null, 2));

// put upcoming events at the top
let mainEvents = _.filter(events, (event) => event.class == 'anime')
basData.nextMainEvent = mainEvents[0];

let socialEvents = _.filter(events, event => ['social', 'cinema'].includes(event.class));
if (socialEvents.length > 0) {
  basData.nextSocial = socialEvents[0];
}

let onlineEvents = _.filter(events, (event) => event.class == 'online');
if (onlineEvents.length > 0) {
  basData.nextOnline = onlineEvents[0];
}

// Recommendations

basData.allTop10 = []

_.each(basData.top10, person => {
  _.each(person.anime, series => {
    basData.allTop10.push(series);
    if (fs.existsSync('series/'+series.picture+'.png')) {
      fs.copyFile('series/'+series.picture+'.png', '../dist/images/series/'+series.picture+'.png', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
});

// compile sources

function writeTemplate(src, dest, data, callback = (err) => {}) {
    let sourceData = fs.readFileSync(src, 'utf-8');
    let template = Handlebars.compile(sourceData);
    let compiled = template(data);
    fs.writeFile('../dist/'+dest, compiled, 'utf-8', callback);
}

// stylesheet
let sassOptions = {};
sass.render({
  file: 'scss/style.scss',
  sassOptions
}, function(err, result) {
  if (err) {
    console.log(err);
  }
  basData.stylesheetVersion = util.md5sum(result.css);
  fs.writeFile('../dist/style.css', result.css, 'utf-8', err => {});

  writeTemplate('www/js/script.js.h', 'script.js', basData, (err) => {
    let scriptData = fs.readFileSync('../dist/script.js');
    basData.scriptVersion = util.md5sum(scriptData);
    
    writeTemplate('www/index2.html.h', 'index.html', basData);
    writeTemplate('www/history.html.h', 'history.html', basData);
    writeTemplate('www/recommendations2.html.h', 'recommendations.html', basData);

    basData['noindex'] = true
    writeTemplate('www/index2.html.h', 'noindex/index.html', basData);
    writeTemplate('www/history.html.h', 'noindex/history.html', basData);
    writeTemplate('www/recommendations2.html.h', 'noindex/recommendations.html', basData);
  });
});


video.makeVideos(basData);
