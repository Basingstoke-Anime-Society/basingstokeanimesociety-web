const fs = require('fs');
const { exec } = require('child_process');
const _ = require('lodash');

const util = require('./util.js');

function makeVideos(basData) {
  // collect the dates on which series change
  let bookends = {};

  _.each({slot1: basData.slot1, slot2: basData.slot2, slot3: basData.slot3}, (slot, slotName) => {
    _.each(slot, series => {
      var dateKey = util.formatShortDate(series.from);
      bookends[dateKey] = {
        date: series.from,
        name: dateKey,
        slot1: null,
        slot2: null,
        slot3: null
      };
    });
  });

  _.each({slot1: basData.slot1, slot2: basData.slot2, slot3: basData.slot3}, (slot, slotName) => {
    _.each(slot, series => {
      var dateKey = util.formatShortDate(series.from);
      // console.log(`On ${dateKey} slot ${slotName} begin ${series.name}`);
      bookends[dateKey][slotName] = series;
    });
  });
  // console.log("All bookends I", bookends);

  let bookendDates = _.keys(bookends);
  bookendDates = bookendDates.sort();
  bookends = _.map(bookendDates, dateKey => bookends[dateKey]);

  // console.log("All bookends II", bookends);

  // fill in the ongoing series from one date to the next
  let slot1 = null, slot2 = null, slot3 = null;
  _.each(bookends, bookend => {
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
  });

  bookends = util.currentAndFuture(bookends);
  // console.log(bookends);


  // Generate bookends
  _.each(bookends, bookend => {
    if (bookend.slot1 === null || bookend.slot1.picture === null || bookend.slot1.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 1");
    }
    if (bookend.slot2 === null || bookend.slot2.picture === null || bookend.slot2.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 2");
    }
    if (bookend.slot3 === null || bookend.slot3.picture === null || bookend.slot3.picture == "") {
      console.log("Skipping bookend:", bookend.name, "due to missing slot 3");
    }

    console.log("Bookend:", bookend.name);
    console.log("Bookend date:", bookend.date);
    let series1picture = 'series/'+bookend.slot1.picture+'.png';
    let series2picture = 'series/'+bookend.slot2.picture+'.png';
    let series3picture = 'series/'+bookend.slot3.picture+'.png';

    // console.log("Comparing dates:", util.formatShortDate(bookend.slot1.from));
    let series1new = util.formatShortDate(bookend.slot1.from) == bookend.name;
    let series2new = util.formatShortDate(bookend.slot2.from) == bookend.name;
    let series3new = util.formatShortDate(bookend.slot3.from) == bookend.name;

    let shadow255 = "video/shadow255.png";
    let shadow315 = "video/shadow315.png";


    // Discord promo banner
    if (fs.existsSync(`../bookends/banner-${bookend.name}.png`)) {
      console.log("Skipping banner:", bookend.name);
    } else {
      let banner_cmd = `magick video/banner-night-9.png -size 800x320`+
        // logo
        ` -draw 'image SrcOver 10,0 72,320 video/logo.png'`+

        // series pic shadows
          // ` -draw 'image SrcOver 86,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 321,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 556,9 219,310 video/shadow255.png'`+
          ` -draw 'image SrcOver 86,14 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 321,14 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 556,14 212,300 video/shadow255.png'`+

        // series pics
        ` -draw 'image SrcOver 90,15 203,290 ${series1picture}'`+
        (series1new ? ` -draw 'image SrcOver 90,15 100,100 video/new-series-ribbon.png'` : '')+
        ` -draw 'image SrcOver 325,15 203,290 ${series2picture}'`+
        (series2new ? ` -draw 'image SrcOver 325,15 100,100 video/new-series-ribbon.png'` : '')+
        ` -draw 'image SrcOver 560,15 203,290 ${series3picture}'`+
        (series3new ? ` -draw 'image SrcOver 560,15 100,100 video/new-series-ribbon.png'`: '')+
        ` ../bookends/banner-${bookend.name}.png`;

      // console.log(banner_cmd);

      exec(banner_cmd, (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err);
        } else {
        }
      });
    }

    // Also do the next date, unless there's a new series starting that day
    let nextDate = util.plus1week(bookend.date);
    console.log("Next date:", nextDate);
    let nextDateKey = util.formatShortDate(nextDate);

    if (!bookendDates.includes(nextDateKey)) {
      console.log("Next date:", nextDateKey);

      if (!fs.existsSync(`../bookends/banner-${nextDateKey}.png`)) {
        let banner2_cmd = `magick video/banner-night-9.png -size 800x320`+
          // logo
          ` -draw 'image SrcOver 10,0 72,320 video/logo.png'`+

          // series pic shadows
          // ` -draw 'image SrcOver 86,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 321,9 219,310 video/shadow255.png'`+
          // ` -draw 'image SrcOver 556,9 219,310 video/shadow255.png'`+
          ` -draw 'image SrcOver 86,14 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 321,14 212,300 video/shadow255.png'`+
          ` -draw 'image SrcOver 556,14 212,300 video/shadow255.png'`+

          // series pics
          // ` -draw 'image SrcOver 90,10 210,300 ${series1picture}'`+
          // ` -draw 'image SrcOver 325,10 210,300 ${series2picture}'`+
          // ` -draw 'image SrcOver 560,10 210,300 ${series3picture}'`+
        ` -draw 'image SrcOver 90,15 203,290 ${series1picture}'`+
        ` -draw 'image SrcOver 325,15 203,290 ${series2picture}'`+
        ` -draw 'image SrcOver 560,15 203,290 ${series3picture}'`+
          ` ../bookends/banner-${nextDateKey}.png`;

        // console.log(banner2_cmd);

        exec(banner2_cmd, (err, stdout, stderr) => {
          if (err) {
            //some err occurred
            console.error(err);
          } else {
          }
        });
      }
    }



    // End of night bookend
    if (fs.existsSync(`../bookends/bookend-${bookend.name}.mp4`)) {
      console.log("Skipping bookend:", bookend.name);
    } else {
      let frameRate = 29.976;
      let bookendDur = 15;

      // let plateDur = 35;
      let plateOffset = 0.5;
      let plateFade = 1.5;
      // let plateEndBuf = 3;
      let plateStart = 2;

      let cmd = `ffmpeg -y -i video/bookend-base.mkv -loop 1 -i ${series1picture} -loop 1 -i ${series2picture} -loop 1 -i ${series3picture} -loop 1 -i ${shadow315} -an `+
        `-filter_complex "`+

        `[1:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
        `[2:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [s2];`+
        `[3:v] fps=fps=${frameRate},fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [s3];`+
        `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
        `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +
        `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [sh3];` +

        `[0:v][s1] overlay=205:135 [in1]; `+
        `[in1][s2] overlay=555:135 [in2]; `+
        `[in2][s3] overlay=905:135 [in3]; `+

        `[in3][sh1] overlay=200:135 [in4]; `+
        `[in4][sh2] overlay=550:135 [in5]; `+
        `[in5][sh3] overlay=900:135 [in6]; `+

        `[in6] fade=in:st=0:d=1 [in7]; `+
        `[in7] fade=out:st=14:d=1" `+
        `-t 00:00:15 ../bookends/bookend-${bookend.name}.mp4`;

      console.log(cmd);

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err)
        } else {
          let cmd2 = `ffmpeg -y -i ../bookends/bookend-${bookend.name}.mp4 -ss 7 -vframes 1 -f image2 ../bookends/preview-${bookend.name}.png`;

          console.log(cmd2);

          exec(cmd2, (err, stdout, stderr) => {
            if (err) {
              //some err occurred
              console.error(err);
            } else {
            }
          });
        }
      });
    }


    // Interval video
    if (fs.existsSync(`../bookends/interval-${bookend.name}.mkv`)) {
      console.log("Skipping interval:", bookend.name);
    } else {
      let frameRate = 29.976;
      let intervalDur = 20 * 60;
      let fade = 2;
      let fadeStart = intervalDur - fade;

      let plateDur = 35;
      let plateOffset = 0.5;
      let plateFade = 1.5;
      let plateEndBuf = 3;
      let plateStart = intervalDur - plateEndBuf - plateDur;
      let plateEnd = intervalDur - plateEndBuf;

      // console.log(`  Interval dur = ${intervalDur}`);
      // console.log(`  Fade start = ${fadeStart}`);
      // console.log(`  Fade dur = ${fade}`);

      // console.log(`  Plate dur = ${plateDur}`);
      // console.log(`  Plate fade dur = ${plateFade}`);
      // console.log(`  Plate start = ${plateStart}`);
      // console.log(`  Plate end = ${plateEnd}`);

      let cmd = `ffmpeg -y -i video/interval-base7.mkv -loop 1 -i ${series1picture} -loop 1 -i ${series2picture} -loop 1 -i ${series3picture} -loop 1 -i ${shadow255} -c:a copy -filter_complex "`+

        `[1:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
        `[2:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [s2];`+
        `[3:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [s3];`+
        `[4:v] fps=fps=${frameRate},scale=265x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
        `[4:v] fps=fps=${frameRate},scale=265x376,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +
        `[4:v] fps=fps=${frameRate},scale=265x376,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [sh3];` +

        `[0:v][s1] overlay=425:327 [in1]; `+
        `[in1][s2] overlay=710:327 [in2]; `+
        `[in2][s3] overlay=995:327 [in3]; `+

        `[in3][sh1] overlay=420:327 [in4]; `+
        `[in4][sh2] overlay=705:327 [in5]; `+
        `[in5][sh3] overlay=990:327 [in6]; `+

        `[in6] fade=out:st=${fadeStart}:d=${fade}" `+
        // `[in3] fade=in:0:60 [in4]; `+
        // `[in3] fade=out:35911:60" `+
        `-t 00:20:00 ../bookends/interval-${bookend.name}.mkv`;

      console.log(cmd);

      exec(cmd, (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err)
        } else {
        }
      });
    }
  });
}


module.exports = {
  makeVideos
};
