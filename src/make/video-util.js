const fs = require('fs');
const { exec } = require('child_process');
const { createHmac } = require('node:crypto');
const colors = require('colors');


const EVENT_COLOURS = {
  'cinema': 'red',
  'special': 'orange',
  'social': 'green',
  'online': 'blue',
  'skip': 'red',
};



function makeBookendVideo(name, series) {
  console.log("Creating bookend:".green, name.yellow, "for series".green, series);

  // series pictures


  // layout
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

  addToCommandQueue(`Bookend ${name}`, cmd);
}



function makeIntervalOverlay(name, series) {
  console.log("Creating interval overlay:".green, name.yellow);

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

  function drawEvent(event, index) {
    // console.log("Event", index, ":", event);
    let colour = EVENT_COLOURS[event.class];
    if (event.special) {
      colour = EVENT_COLOURS['special'];
    }

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

  addToCommandQueue(`Overlay ${name}`, overlay_cmd);
}

function makeIntervalVideo(name, series) {
  console.log("Creating interval:".green, name.yellow);

  // console.log("Events on:", tuesday.name.yellow, events);

  // console.log(" - Overlay:", fs.existsSync(`../bookends/overlay-${name}.png`) ? "exists".green : "missing".red);
  // console.log(" - Interval:", fs.existsSync(`../bookends/interval-${name}.mkv`) ? "exists".green : "missing".red);
  // console.log(" - Bookend:", fs.existsSync(`../bookends/bookend-${name}.mkv`) ? "exists".green : "missing".red);
  // console.log(" - Events key:", eventsKey, eventsKeyMatch(eventsKey, previousByDate[name]) ? "match".green : "no match".red);


  let series1picture = 'series/'+schedule.slot1.series.picture+'.png';
  let series2picture = 'series/'+schedule.slot2.series.picture+'.png';
  let series3picture = 'series/'+schedule.slot3.series.picture+'.png';

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

  addToCommandQueue(`Interval ${name}`, cmd);
}



function addToCommandQueue(name, cmd) {
  commandQueue.push({name, cmd});
}


function runCommandQueue() {
  if (commandQueue.length == 0) {
    console.log("End of command queue".green);
    return;
  }

  let {name, cmd} = commandQueue.shift();
  console.log("Running command:".green, name);

  exec(cmd, (err, stdout, stderr) => {
    if (err != null) {
      console.log("Error running command:".red, name, `<<${cmd}>>`, err);
    }

    runCommandQueue();
  });
}

module.exports = {
  makeBookendVideo,
  makeIntervalOverlay,
  makeIntervalVideo,
  addToCommandQueue,
  runCommandQueue
};
