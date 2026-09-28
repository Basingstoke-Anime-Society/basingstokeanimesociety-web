const fs = require('fs');
const colors = require('colors');

const util = require('./util.js');
const videoUtil = require('./video-util.js');

const intervalAudioTracks = [
  'video/Interval music 1 - Carole & Tuesday.mp3',
  'video/Interval music 2 - Final fantasy.mp3',
  'video/Interval music 3 - Call of the Night v3.mp3'
];

const SKIP_BANNERS = false;
const SKIP_OVERLAY = false;
const SKIP_INTERVALS = false;
const SKIP_BOOKENDS = false;

const shadow255 = "video/shadow255.png";
const shadow315 = "video/shadow315.png";

let commandQueue = [];



function makePlaylistVideos(basData) {

  console.log("\n\n\n\n");
  console.log("VIDEOS".bold);



  // ============ BOOKENDS ============ //

  // collect the dates on which series change
  let bannerWeeks = {};

  // make blanks for all new-series weeks
  for (let slotName of ['slot1', 'slot2', 'slot3']) {
    let slot = basData[slotName];
    for (let series of slot) {
      var dateKey = util.formatShortDate(series.from);
      bannerWeeks[dateKey] = {
        date: series.from,
        name: dateKey,
        slot1: null,
        slot2: null,
        slot3: null
      };
    }
  }

  // fill in the series
  for (let slotName of ['slot1', 'slot2', 'slot3']) {
    let slot = basData[slotName];
    for (let series of slot) {
      var dateKey = util.formatShortDate(series.from);
      bannerWeeks[dateKey][slotName] = series;
    }
  }

  // console.log("All banners I", bannerWeeks);

  let bannerDates = Object.keys(bannerWeeks);
  bannerDates = bannerDates.sort();
  let banners = bannerDates.map((dateKey) => bannerWeeks[dateKey]);

  // console.log("All banners II", banners);

  // fill in the ongoing series from one date to the next
  let slot1 = null, slot2 = null, slot3 = null;
  for (let banner of banners) {
    if (banner.slot1 !== null) {
      slot1 = banner.slot1;
    } else {
      banner.slot1 = slot1;
    }
    if (banner.slot2 !== null) {
      slot2 = banner.slot2;
    } else {
      banner.slot2 = slot2;
    }
    if (banner.slot3 !== null) {
      slot3 = banner.slot3;
    } else {
      banner.slot3 = slot3;
    }
  }

  banners = util.currentAndFuture(banners);
  // console.log("All banners III:", banners);

  // Generate banners
  if (!SKIP_BANNERS) {
    for (let banner of banners) {
      if (banner.slot1 === null || banner.slot1.picture === null || banner.slot1.picture == "") {
        console.log("Skipping banner:", banner.name, "due to missing slot 1");
        return;
      }
      if (banner.slot2 === null || banner.slot2.picture === null || banner.slot2.picture == "") {
        console.log("Skipping banner:", banner.name, "due to missing slot 2");
        return;
      }
      if (banner.slot3 === null || banner.slot3.picture === null || banner.slot3.picture == "") {
        console.log("Skipping banner:", banner.name, "due to missing slot 3");
        return;
      }

      // console.log("New series on:", banner.name.yellow);
      // console.log("Bookend date:", banner.date);
      let series1picture = 'series/'+banner.slot1.picture+'.png';
      let series2picture = 'series/'+banner.slot2.picture+'.png';
      let series3picture = 'series/'+banner.slot3.picture+'.png';

      // console.log("Comparing dates:", util.formatShortDate(banner.slot1.from));
      let series1new = util.formatShortDate(banner.slot1.from) == banner.name;
      let series2new = util.formatShortDate(banner.slot2.from) == banner.name;
      let series3new = util.formatShortDate(banner.slot3.from) == banner.name;


      // Discord promo banner
      if (fs.existsSync(`../bookends/banner-${banner.name}.png`)) {
        console.log("Skipping banner:".blue, banner.name.yellow);
      } else {
        console.log("Creating banner:".green, banner.name.yellow);
        let banner_cmd = `magick "video/New Banner Base.png" -size 800x320`+
          // series pic shadows
            ` -draw 'image SrcOver 34,160 212,299 video/shadow255.png'`+
            ` -draw 'image SrcOver 269,160 212,299 video/shadow255.png'`+
            ` -draw 'image SrcOver 504,160 212,299 video/shadow255.png'`+

          // series pics
          ` -draw 'image SrcOver 38,160 203,290 ${series1picture}'`+
          (series1new ? ` -draw 'image SrcOver 38,160 100,100 video/new-series-ribbon.png'` : '')+
          ` -draw 'image SrcOver 273,160 203,290 ${series2picture}'`+
          (series2new ? ` -draw 'image SrcOver 273,160 100,100 video/new-series-ribbon.png'` : '')+
          ` -draw 'image SrcOver 508,160 203,290 ${series3picture}'`+
          (series3new ? ` -draw 'image SrcOver 508,160 100,100 video/new-series-ribbon.png'`: '')+
          ` ../bookends/banner-${banner.name}.png`;

        addToCommandQueue(`Banner ${name}`, banner_cmd);
      }

    }
  }



  // ============ LOAD JSON =========== //

  let previousData = JSON.parse(fs.readFileSync('../bookends/bookends.json'));

  // console.log("Previous bookend data:", previousData);

  let previousByDate = {};
  for (let prev of previousData) {
    // util.expandDate(prev);
    previousByDate[prev.shortDate] = prev;
  }



  // ============ INTERVALS ============ //


  // Look for events worth displaying on the interval
  let promoEvents = util.futureN(basData.events, 100);
  console.log("Upcoming events:", promoEvents);
  promoEvents = promoEvents.filter((event) => ['cinema', 'social', 'skip' /*, 'online'*/].includes(event.class) && !event.hide);
  // console.log("Found worthy events:", promoEvents);

  // Find the end of each slot's scheduled shows
  function lastSlot(slot) {
    let lastAnime = slot[slot.length - 1];
    lastWeek = lastAnime.weeks[lastAnime.weeks.length - 1];
    return lastWeek.week;
  }

  let lastSlot1 = lastSlot(basData.slot1);
  let lastSlot2 = lastSlot(basData.slot2);
  let lastSlot3 = lastSlot(basData.slot3);
  // console.log("Last slots:", lastSlot1, lastSlot2, lastSlot3);


  // Find all the Tuesdays we have scheduled
  let tuesdays = basData.events.filter((event) => event.class == 'anime');
  tuesdays = util.futureN(tuesdays, 20);
  // console.log("Future Tuesdays", tuesdays);


  // make the intervals
  for (let tuesday of tuesdays) {
    let name = tuesday.shortDate;
    let prevWeekName = util.formatShortDate(util.minus1week(tuesday.date));

    let schedule = basData.schedule[name];
    // console.log("Interval schedule:", name, "-", schedule);

    // if (schedule === undefined || schedule.slot1 === undefined || schedule.slot2 === undefined || schedule.slot3 === undefined) {
    if (schedule === undefined || name > lastSlot1 || name > lastSlot2 || name > lastSlot3) {
      console.log("Skipping from unscheduled week:".blue, name.yellow);
      break;
    }

    let events = util.futureN(promoEvents, 3, 'date', false, new Date(tuesday.date));
    let cutoff = util.plusNmonth(new Date(tuesday.date), 2);
    events = events.filter((event) => event.date < cutoff);

    // console.log("Events on:", tuesday.name.yellow, events);

    // Make an events key to compare to the last time
    let eventsKey = events.map((e) => {
      let n = (e.screenname ? e.screenname : e.name);
      return `${e.shortDate}|${e.name}`;
    }).join(',');
    // console.log("Events key", eventsKey);

    function eventsKeysMatch(eventsKey, previous) {
      if (previous === undefined || previous === null) {
        return false;
      }
      if (!('eventsKey' in previous) || previous.eventsKey === undefined || previous.eventsKey == null) {
        return false;
      }
      return previous.eventsKey == eventsKey;
    }


    // =========== MAKE THINGS ========== //

    if (fs.existsSync(`../bookends/overlay-${name}.png`)
        && (SKIP_INTERVALS || fs.existsSync(`../bookends/interval-${name}.mkv`))
        && (SKIP_BOOKENDS || fs.existsSync(`../bookends/bookend-${prevWeekName}.mkv`))
        && eventsKeysMatch(eventsKey, previousByDate[name])) {
      console.log("Skipping interval:".blue, name.yellow, "and bookend:".blue, prevWeekName.yellow);
    } else {
      let series = [schedule.slot1.series, schedule.slot2.series, schedule.slot3.series];

      if (!SKIP_OVERLAY) {
        videoUtil.makeIntervalOverlay(name, series);
      }
      if (!SKIP_INTERVALS) {
        videoUtil.makeIntervalVideo(name, series);
      }
      if (!SKIP_BOOKENDS) {
        videoUtil.makeBookendVideo(name, series);
      }
    }


    // ========== PLAYLIST ========== //
    makeBlankPlaylist(name);
  }


  // ============ SAVE JSON =========== //

  // TODO cull data fields

  let nextData = [];
  for (let en in previousByDate) {
    let event = previousByDate[en];
    let { shortDate, eventsKey } = event;
    nextData.push({ shortDate, eventsKey});
  }

  // console.log("NEXT DATA:", nextData);

  fs.writeFile('../bookends/bookends.json', JSON.stringify(nextData), 'utf-8', (err) => {
    if (err != null) {
      console.log("Error saving bookend data:".red, err);
    }
  });



  // ============ RUN THE ITEMS =========== //

  videoUtil.runCommandQueue();
}



function makeBlankPlaylist() {
  let playlistName = name.replace('-', ' ').replace('-', ' ');
  playlistFile = `/home/mdowning/Anime/Playlists/${playlistName}.zpl`

  if (fs.existsSync(playlistFile)) {
    console.log("Skipping playlist:".blue, playlistName);
  } else {
    console.log("Making playlist:".green, playlistName);

    let intervalPath = `C:\\Users\\marcu\\Documents\\Anime Society Website\\bookends\\interval-${name}.mkv`;
    let bookendPath = `C:\\Users\\marcu\\Documents\\Anime Society Website\\bookends\\bookend-${name}.mkv`;
    let playlistBody = `\ufeffac=${intervalPath}
nm=${intervalPath}
dr=1199
ft=3
br!
nm=${intervalPath}
dr=1199
ft=3
br!
nm=${intervalPath}
dr=1199
ft=3
br!
nm=${bookendPath}
dr=14
ft=3
br!
`;
    fs.writeFile(playlistFile, playlistBody, 'utf16le', (err) => {
      if (err) {
        console.log("Error writing blank playlist:".red, err);
      }
    });
  }
}


module.exports = {
  makePlaylistVideos,
};
