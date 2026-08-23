const fs = require('fs');
const { exec } = require('child_process');
const { createHmac } = require('node:crypto');
const _ = require('lodash');
const colors = require('colors');

const util = require('./util.js');

const intervalAudioTracks = [
  'video/Interval music 1 - Carole & Tuesday.mp3',
  'video/Interval music 2 - Final fantasy.mp3',
  'video/Interval music 3 - Call of the Night v2.mp3'
];

function makeVideos(basData) {

  console.log("\n\n\n\n");
  console.log("VIDEOS".bold);



  // ============ BOOKENDS ============ //

  // collect the dates on which series change
  let bookends = {};

  _.each({slot1: basData.slot1, slot2: basData.slot2, slot3: basData.slot3}, (slot, slotName) => {
    for (let series of slot) {
      var dateKey = util.formatShortDate(series.from);
      bookends[dateKey] = {
        date: series.from,
        name: dateKey,
        slot1: null,
        slot2: null,
        slot3: null
      };
    }
  });

  _.each({slot1: basData.slot1, slot2: basData.slot2, slot3: basData.slot3}, (slot, slotName) => {
    for (let series of slot) {
      var dateKey = util.formatShortDate(series.from);
      // console.log(`On ${dateKey} slot ${slotName} begin ${series.name}`);
      bookends[dateKey][slotName] = series;
    }
  });
  // console.log("All bookends I", bookends);

  let bookendDates = _.keys(bookends);
  bookendDates = bookendDates.sort();
  bookends = _.map(bookendDates, dateKey => bookends[dateKey]);

  // console.log("All bookends II", bookends);

  // fill in the ongoing series from one date to the next
  let slot1 = null, slot2 = null, slot3 = null;
  for (let bookend of bookends) {
    if (bookend.slot1 !== null) {
      slot1 = bookend.slot1;
    } else {
      bookend.slot1 = slot1;
    }
    if (bookend.slot2 !== null) {
      slot2 = bookend.slot2;
    } else {
      bookend.slot2 = slot2;
    }
    if (bookend.slot3 !== null) {
      slot3 = bookend.slot3;
    } else {
      bookend.slot3 = slot3;
    }
  }

  bookends = util.currentAndFuture(bookends);
  // console.log("Bookends:", bookends);

  let shadow255 = "video/shadow255.png";
  let shadow315 = "video/shadow315.png";

  // Generate bookends
  _.each(bookends, bookend => {
    if (bookend.slot1 === null || bookend.slot1.picture === null || bookend.slot1.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 1");
      return;
    }
    if (bookend.slot2 === null || bookend.slot2.picture === null || bookend.slot2.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 2");
      return;
    }
    if (bookend.slot3 === null || bookend.slot3.picture === null || bookend.slot3.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 3");
      return;
    }

    // console.log("New series on:", bookend.name.yellow);
    // console.log("Bookend date:", bookend.date);
    let series1picture = 'series/'+bookend.slot1.picture+'.png';
    let series2picture = 'series/'+bookend.slot2.picture+'.png';
    let series3picture = 'series/'+bookend.slot3.picture+'.png';

    // console.log("Comparing dates:", util.formatShortDate(bookend.slot1.from));
    let series1new = util.formatShortDate(bookend.slot1.from) == bookend.name;
    let series2new = util.formatShortDate(bookend.slot2.from) == bookend.name;
    let series3new = util.formatShortDate(bookend.slot3.from) == bookend.name;


    // Discord promo banner
    if (fs.existsSync(`../bookends/banner-${bookend.name}.png`)) {
      console.log("Skipping banner:".blue, bookend.name.yellow);
    } else {
      console.log("Creating banner:".green, bookend.name.yellow);
      let banner_cmd = `magick "video/New Banner Base.png" -size 800x320`+
        // logo
        // ` -draw 'image SrcOver 10,0 72,320 video/logo.png'`+

        // series pic shadows
          // ` -draw 'image SrcOver 86,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 321,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 556,9 219,310 video/shadow255.png'`+
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
        ` ../bookends/banner-${bookend.name}.png`;

      // console.log(banner_cmd);

      exec(banner_cmd, (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error("Error making banner:".red, err.red);
        } else {
        }
      });
    }

    /*
    // Also do the next date, unless there's a new series starting that day
    let nextDate = util.plus1week(bookend.date);
    // console.log("Next date:", nextDate.yellow);
    let nextDateKey = util.formatShortDate(nextDate);

    if (!bookendDates.includes(nextDateKey)) {
      console.log("Next date:", nextDateKey.yellow);

      if (!fs.existsSync(`../bookends/banner-${nextDateKey}.png`)) {
        let banner2_cmd = `magick video/banner-night-9.png -size 800x320`+
          // logo
          ` -draw 'image SrcOver 10,0 72,320 video/logo.png'`+

          // series pic shadows
          // ` -draw 'image SrcOver 86,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 321,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 556,9 219,310 video/shadow255.png'`+
          ` -draw 'image SrcOver 226,290 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 510,290 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 796,290 212,300 video/shadow255.png'`+

          // series pics
          // ` -draw 'image SrcOver 90,10 210,300 ${series1picture}'`+
          // ` -draw 'image SrcOver 325,10 210,300 ${series2picture}'`+
          // ` -draw 'image SrcOver 560,10 210,300 ${series3picture}'`+
        ` -draw 'image SrcOver 230,290 203,290 ${series1picture}'`+
        ` -draw 'image SrcOver 515,290 203,290 ${series2picture}'`+
        ` -draw 'image SrcOver 800,290 203,290 ${series3picture}'`+
          ` ../bookends/banner-${nextDateKey}.png`;

        // console.log(banner2_cmd);

        exec(banner2_cmd, (err, stdout, stderr) => {
          if (err) {
            //some err occurred
            console.error("Error making banner:".red, err);
          } else {
          }
        });
      }
    }
    */



  });



  // ============ LOAD JSON =========== //

  let previousData = JSON.parse(fs.readFileSync('../bookends/bookends.json'));
  // let nextData = structuredClone(util.currentAndFuture(previousData));

  console.log("Previous bookend data:", previousData);
  // console.log("Next bookend data:", nextData);

  let previousByDate = {};
  for (let prev of previousData) {
    // util.expandDate(prev);
    previousByDate[prev.shortDate] = prev;
  }



  // ============ INTERVALS ============ //


  // Look for events worth displaying on the interval
  let promoEvents = util.futureN(basData.events, 20);
  promoEvents = promoEvents.filter((event) => ['cinema', 'social' /*, 'online'*/].includes(event.class));
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
  tuesdays = util.futureN(tuesdays, 10);
  // console.log("Future Tuesdays", tuesdays);

  // make the intervals
  for (let tuesday of tuesdays) {
    let name = tuesday.shortDate;

    let schedule = basData.schedule[name];
    // console.log("Interval schedule:", name, "-", schedule);

    // if (schedule === undefined || schedule.slot1 === undefined || schedule.slot2 === undefined || schedule.slot3 === undefined) {
    if (schedule === undefined || name > lastSlot1 || name > lastSlot2 || name > lastSlot3) {
      console.log("Skipping from unscheduled week:".blue, name.yellow);
      break;
    }

    let events = util.futureN(promoEvents, 3, 'date', false, new Date(name));
    let cutoff = util.plus1month(new Date(tuesday.date));
    events = events.filter((event) => event.date < cutoff);

    // console.log("Events on:", tuesday, events);

    // Make an events key to compare to the last time
    let eventsKey = events.map((e) => {
      let n = (e.screenname ? e.screenname : e.name);
      return `${e.shortDate}|${e.name}`;
    }).join(',');
    // console.log("Events key", eventsKey);

    function eventsKeyMatch(eventsKey, previous) {
      if (previous === undefined || previous === null) {
        return false;
      }
      if (!('eventsKey' in previous) || previous.eventsKey === undefined || previous.eventsKey == null) {
        return false;
      }
      return previous.eventsKey == eventsKey;
    }




    if (fs.existsSync(`../bookends/overlay-${name}.png`)
        && fs.existsSync(`../bookends/interval-${name}.mkv`)
        && fs.existsSync(`../bookends/bookend-${name}.mkv`)
        && eventsKeyMatch(eventsKey, previousByDate[name])) {
      console.log("Skipping interval:".blue, name.yellow);
    } else {
      console.log("Creating interval:".green, name.yellow);

      // console.log(" - Overlay:", fs.existsSync(`../bookends/overlay-${name}.png`) ? "exists".green : "missing".red);
      // console.log(" - Interval:", fs.existsSync(`../bookends/interval-${name}.mkv`) ? "exists".green : "missing".red);
      // console.log(" - Bookend:", fs.existsSync(`../bookends/bookend-${name}.mkv`) ? "exists".green : "missing".red);
      // console.log(" - Events key:", eventsKey, eventsKeyMatch(eventsKey, previousByDate[name]) ? "match".green : "no match".red);



      // === INTERVAL OVERLAY === //

      tuesday.eventsKey = eventsKey;
      previousByDate[name] = tuesday;

      const E_TOP = 20;
      const E_SQUARE = 64;
      const E_MID = E_SQUARE / 2 + 1;
      const E_START = 40;
      const E_SHIFT = 400;
      const E_WIDTH = 300;
      const E_PRENAME = 2;
      const E_BASELINE = 28;
      const E_SHADOW = E_BASELINE + 1;
      const E_DAY = 27;
      const E_MONTH = 61;
      const E_NAME_OFFSET = 80;

      const COLOURS = {
        'cinema': 'red',
        'social': 'green',
        'online': 'blue'
      };

      function drawEvent(event, index) {
        // console.log("Event", index, ":", event);
        let colour = COLOURS[event.class];

        let eLeft = E_START + (E_SHIFT * index);
        let eMid = eLeft + E_MID;
        let eName = eLeft + E_NAME_OFFSET;

        // console.log("Colour:", colour, "Left:", eLeft, "Mid:", eMid, "Name:", eName);

        let displayName = (event.screenname ? event.screenname : event.name);

        let cmd =
          `-gravity northwest -draw "image SrcOver ${eLeft},${E_TOP} ${E_SQUARE},${E_SQUARE} video/date-${colour}.png" `+
          `\\( -pointsize 36 -fill black -background None -stroke none -strokewidth 0 +size label:"${event.day}" -geometry +%[fx:${eMid}-w/2]+${E_DAY} \\) -composite `+
          `\\( -pointsize 16 -fill black -background None -stroke none -strokewidth 0 +size label:"${event.month}" -geometry +%[fx:${eMid}-w/2]+${E_MONTH} \\) -composite `;

        if (event.prename) {
          cmd = cmd +
            `-font 'Open Sans ExtraBold' -pointsize 16 ` +
            `-draw "fill black text ${eName},${E_PRENAME+1} '${event.prename.toUpperCase()}'" ` +
            `-draw "fill #ff8 text ${eName},${E_PRENAME} '${event.prename.toUpperCase()}'" `;
        }

        cmd = cmd +
          `-font 'Open Sans Bold' -pointsize 28 `+
          `\\( -pointsize 28 -fill black -stroke black -strokewidth 1 -gravity west -size ${E_WIDTH}x${E_SQUARE} caption:"${displayName}" -geometry +${eName}+5 \\) -composite `+
          `\\( -pointsize 28 -fill white -stroke none -strokewidth 0 -gravity west -size ${E_WIDTH}x${E_SQUARE} caption:"${displayName}" -geometry +${eName}+4 \\) -composite `;
          // `-gravity northwest -draw "fill black stroke black text ${eName},${E_SHADOW} '${name}'" `+
          // `-gravity northwest -draw "fill white text ${eName},${E_BASELINE} '${name}'" `;

        // console.log(cmd);
        return cmd;
      }


      let overlay_cmd = `magick -size 1280x100 xc:none `+

      // label settings
      `-font 'Open Sans Bold' -pointsize 24 `;

      if (events.length > 0) {
        overlay_cmd = overlay_cmd + drawEvent(events[0], 0);
      }

      if (events.length > 1) {
        overlay_cmd = overlay_cmd + drawEvent(events[1], 1);
      }

      if (events.length > 2) {
        overlay_cmd = overlay_cmd + drawEvent(events[2], 2);
      }

      // write
      overlay_cmd = overlay_cmd +
        `../bookends/overlay-${name}.png`;

      console.log(overlay_cmd);
      exec(overlay_cmd, (err, stdout, stderr) => {
        if (err) {
          console.log("Error making overlay:".red, err);
          return;
        }



        // === INTERVAL VIDEO === //

        let frameRate = 24;
        let intervalDur = 20 * 60;
        let fadeDur = 2;
        let fadeOutStart = intervalDur - fadeDur;

        let plateDur = 35;
        let plateOffset = 0.5;
        let plateFadeDur = 1.5;
        let plateEndBuf = 3;
        let plateStart = intervalDur - plateEndBuf - plateDur;
        let plateEnd = intervalDur - plateEndBuf;

        let series1picture = 'series/'+schedule.slot1.series.picture+'.png';
        let series2picture = 'series/'+schedule.slot2.series.picture+'.png';
        let series3picture = 'series/'+schedule.slot3.series.picture+'.png';

        let hash = createHmac('sha256', 'SECRET AGENT MAAAAAN!')
                 .update(name)
                 .digest('hex');
        let index = parseInt(hash, 16) % 3;
        console.log("Interval", name.yellow, "uses interval music", index, "-", intervalAudioTracks[index]);
        let randomAudio = intervalAudioTracks[index];

        let eventsPlate = `../bookends/overlay-${name}.png`;

        let cmd = `ffmpeg -y -i "video/New Interval Base.mkv" `+
          `-loop 1 -i ${series1picture} `+
          `-loop 1 -i ${series2picture} `+
          `-loop 1 -i ${series3picture} `+
          `-loop 1 -i ${shadow255} `+
          `-i "${randomAudio}" `+
          `-loop 1 -i "${eventsPlate}" `+

          `-filter_complex "`+

          `[1:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [s1];`+
          `[2:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [s2];`+
          `[3:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart}:d=${plateFadeDur}:alpha=1 [s3];`+
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [sh1];` +
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [sh2];` +
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart}:d=${plateFadeDur}:alpha=1 [sh3];` +
          `[6:v] fps=fps=${frameRate},fade=out:st=${plateStart - plateFadeDur * 2}:d=${plateFadeDur}:alpha=1 [events];` +

          `[0:v][s1] overlay=230:327 [in1]; `+
          `[in1][s2] overlay=515:327 [in2]; `+
          `[in2][s3] overlay=800:327 [in3]; `+

          `[in3][sh1] overlay=226:327 [in4]; `+
          `[in4][sh2] overlay=510:327 [in5]; `+
          `[in5][sh3] overlay=796:327 [in6]; `+

          `[in6][events] overlay=0:600 [in7]; `+

          `[in7] fade=in:st=0:d=${fadeDur},fade=out:st=${fadeOutStart}:d=${fadeDur}" `+
          // `[in3] fade=in:0:60 [in4]; `+
          // `[in3] fade=out:35911:60" `+
          `-t 00:20:00 -sws_flags lanczos `+

          `-map "5:a" `+
          `../bookends/interval-${name}.mkv`;

        console.log(cmd);

        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            //some err occurred
            console.error("Error making interval:".red, err)
          } else {
          }
        });


        // === END OF NIGHT BOOKEND === //

        let bookendDur = 15;

        // let plateDur = 35;
        plateOffset = 0.5;
        plateFade = 1.5;
        // let plateEndBuf = 3;
        plateStart = 2;

        cmd = `ffmpeg -y `+
          `-i "video/New Bookend Base.mkv" -loop 1 `+
          `-i ${series1picture} -loop 1 `+
          `-i ${series2picture} -loop 1 `+
          `-i ${series3picture} -loop 1 `+
          `-i ${shadow255} -an `+
          `-filter_complex "`+

          `[1:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
          `[2:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [s2];`+
          `[3:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [s3];`+
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +
          `[4:v] fps=fps=${frameRate},scale=264x376,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [sh3];` +

          // `[0:v][s1] overlay=205:135 [in1]; `+
          // `[in1][s2] overlay=555:135 [in2]; `+
          // `[in2][s3] overlay=905:135 [in3]; `+

          // `[in3][sh1] overlay=200:135 [in4]; `+
          // `[in4][sh2] overlay=550:135 [in5]; `+
          // `[in5][sh3] overlay=900:135 [in6]; `+

          `[0:v][s1] overlay=230:290 [in1]; `+
          `[in1][s2] overlay=515:290 [in2]; `+
          `[in2][s3] overlay=800:290 [in3]; `+

          `[in3][sh1] overlay=226:290 [in4]; `+
          `[in4][sh2] overlay=510:290 [in5]; `+
          `[in5][sh3] overlay=796:290 [in6]; `+

          `[in6] fade=in:st=0:d=1 [in7]; `+
          `[in7] fade=out:st=14:d=1" `+
          `-t 00:00:15 ../bookends/bookend-${name}.mkv`;

        console.log(cmd);

        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            console.error("Error making bookend:".red, err);
          }
        });


      });
    }
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

}


module.exports = {
  makeVideos
};
