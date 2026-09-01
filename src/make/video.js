const fs = require('fs');
const { exec } = require('child_process');
const { createHmac } = require('node:crypto');
const _ = require('lodash');
const colors = require('colors');

const util = require('./util.js');

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



function makeVideos(basData) {

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

        // console.log(banner_cmd);

        exec(banner_cmd, (err, stdout, stderr) => {
          if (err) {
            //some err occurred
            console.error("Error making banner:".red, err.red);
          } else {
          }
        });
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
  let promoEvents = util.futureN(basData.events, 50);
  console.log("Upcoming events:", promoEvents);
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
    let cutoff = util.plus1month(new Date(tuesday.date));
    events = events.filter((event) => event.date < cutoff);

    // console.log("Events on:", tuesday.name.yellow, events);

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
        && (SKIP_INTERVALS || fs.existsSync(`../bookends/interval-${name}.mkv`))
        && (SKIP_BOOKENDS || fs.existsSync(`../bookends/bookend-${prevWeekName}.mkv`))
        && eventsKeyMatch(eventsKey, previousByDate[name])) {
      console.log("Skipping interval:".blue, name.yellow, "and bookend:".blue, prevWeekName.yellow);
    } else {
      console.log("Creating interval:".green, name.yellow, "and bookend:".green, prevWeekName.yellow);

      // console.log("Events on:", tuesday.name.yellow, events);

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
      const E_WEEKDAY = 23;
      const E_DAY = 38;
      const E_MONTH = 67;
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
          `-font 'Noto-Sans' -pointsize 16 -gravity northwest -draw "image SrcOver ${eLeft},${E_TOP} ${E_SQUARE},${E_SQUARE} video/date-${colour}.png" `+
          `\\( -pointsize 15 -fill black -background None -stroke none -strokewidth 0 +size label:"${event.shortWeekday}" -geometry +%[fx:${eMid}-w/2]+${E_WEEKDAY} \\) -composite `+
          `\\( -pointsize 34 -fill black -background None -stroke none -strokewidth 0 +size label:"${event.day}" -geometry +%[fx:${eMid}-w/2]+${E_DAY} \\) -composite `+
          `\\( -pointsize 15 -fill black -background None -stroke none -strokewidth 0 +size label:"${event.month}" -geometry +%[fx:${eMid}-w/2]+${E_MONTH} \\) -composite `;

        if (event.prename) {
          cmd = cmd +
            `-font 'Noto-Sans-Bold' -pointsize 16 ` +
            `-draw "fill black text ${eName},${E_PRENAME+1} '${event.prename.toUpperCase()}'" ` +
            `-draw "fill #ff8 text ${eName},${E_PRENAME} '${event.prename.toUpperCase()}'" `;
        }

        cmd = cmd +
          `-font 'Noto-Sans-Condensed-Bold' `+
          `\\( -pointsize 28 -fill black -stroke black -strokewidth 1 -gravity west -size ${E_WIDTH}x${E_SQUARE} caption:"${displayName}" -geometry +${eName}+3 \\) -composite `+
          `\\( -pointsize 28 -fill white -stroke none -strokewidth 0 -gravity west -size ${E_WIDTH}x${E_SQUARE} caption:"${displayName}" -geometry +${eName}+2 \\) -composite `;
          // `-gravity northwest -draw "fill black stroke black text ${eName},${E_SHADOW} '${name}'" `+
          // `-gravity northwest -draw "fill white text ${eName},${E_BASELINE} '${name}'" `;

        // console.log(cmd);
        return cmd;
      }


      let overlay_cmd = `magick -size 1280x100 xc:none `;

      if (events.length > 0) {
        overlay_cmd = overlay_cmd + drawEvent(events[0], 0);

        if (events.length > 1) {
          overlay_cmd = overlay_cmd + drawEvent(events[1], 1);

          if (events.length > 2) {
            overlay_cmd = overlay_cmd + drawEvent(events[2], 2);
          }
        }
      } else {
        overlay_cmd = overlay_cmd +
          `-font 'Open Sans Bold' -pointsize 28 -draw "fill black text 100,100 '.'" `;
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

        let series1picture = 'series/'+schedule.slot1.series.picture+'.png';
        let series2picture = 'series/'+schedule.slot2.series.picture+'.png';
        let series3picture = 'series/'+schedule.slot3.series.picture+'.png';



        // === INTERVAL VIDEO === //
        let frameRate = 24;
        let intervalDur = 20 * 60;
        let fadeDur = 2;
        let fadeOutStart = intervalDur - fadeDur;

        if (!SKIP_INTERVALS) {
          let plateDur = 35;
          let plateOffset = 0.5;
          let plateFadeDur = 1.5;
          let plateEndBuf = 3;
          let plateStart = intervalDur - plateEndBuf - plateDur;
          let plateEnd = intervalDur - plateEndBuf;

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
            `-t 00:20:00 -sws_flags lanczos `+

            `-map "5:a" `+
            `../bookends/interval-${name}.mkv`;

          console.log(cmd);

          exec(cmd, (err, stdout, stderr) => {
            if (err) {
              console.error("Error making interval:".red, err)
            } else {
            }
          });
        }




        // === END OF NIGHT BOOKEND === //

        if (!SKIP_BOOKENDS) {
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

            `[0:v][s1] overlay=230:290 [in1]; `+
            `[in1][s2] overlay=515:290 [in2]; `+
            `[in2][s3] overlay=800:290 [in3]; `+

            `[in3][sh1] overlay=226:290 [in4]; `+
            `[in4][sh2] overlay=510:290 [in5]; `+
            `[in5][sh3] overlay=796:290 [in6]; `+

            `[in6] fade=in:st=0:d=1 [in7]; `+
            `[in7] fade=out:st=14:d=1" `+
            `-t 00:00:15 ../bookends/bookend-${prevWeekName}.mkv`;

          console.log(cmd);

          exec(cmd, (err, stdout, stderr) => {
            if (err) {
              console.error("Error making bookend:".red, err);
            }
          });

        }


      });
    }


    // ========== PLAYLIST ========== //

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
      })
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
