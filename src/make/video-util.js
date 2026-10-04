const fs = require('fs');
const { exec } = require('child_process');
const colors = require('colors');


const FRAME_RATE = 24;
const BOOKEND_DUR = 15;
const INTERVAL_DUR = 20 * 60;

const EVENT_COLOURS = {
  'cinema': 'red',
  'special': 'orange',
  'social': 'green',
  'online': 'blue',
  'skip': 'red',
};

const SHADOW255 = "video/shadow255.png";
const SHADOW315 = "video/shadow315.png";

// LAYOUT CONSTANTS
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

// Command Queue
let commandQueue = [];


function seriesPictures(series) {
  return series.map((s) => 'series/'+s.picture+'.png').slice(0, 3);
}




function makeBookendVideo(name, series) {
  console.log("Creating bookend:".green, name.yellow, "for series".green, series);

  // series pictures
  let pictures = seriesPictures(series);

  // layout
  plateOffset = 0.5;
  plateFade = 1.5;
  plateStart = 2;

  cmd = `ffmpeg -y `+
    `-i "video/New Bookend Base.mkv" -loop 1 `+
    `-i ${SHADOW255} -loop 1 `+
    pictures.map((pic) => `-i ${pic} -loop 1 `).join(" ")+
    `-filter_complex "`;

  switch (pictures.length) {
  case 1:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1]; ` +
      `[2:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [pic1]; `+

      `[0:v][sh1] overlay=510:290 [shadowed]; `+
      `[shadowed][pic1] overlay=515:290 [full]; `;
    break;

  case 2:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1]; ` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2]; ` +
      `[2:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [pic1]; `+
      `[3:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [pic2]; `+

      `[0:v][sh1] overlay=367:290 [in1]; `+
      `[in1][sh2] overlay=653:290 [shadowed]; `+

      `[shadowed][pic1] overlay=372:290 [in2]; `+
      `[in2][pic2] overlay=658:290 [full]; `;

    break;

  case 3:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [sh3];` +
      `[2:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [pic1];`+
      `[3:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [pic2];`+
      `[4:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [pic3];`+

      `[0:v][sh1] overlay=226:290 [in1]; `+
      `[in1][sh2] overlay=510:290 [in2]; `+
      `[in2][sh3] overlay=796:290 [shadowed]; `+

      `[shadowed][pic1] overlay=230:290 [in3]; `+
      `[in3][pic2] overlay=515:290 [in4]; `+
      `[in4][pic3] overlay=800:290 [full]; `;
    break;

  default:
    console.log(`Cannot make bookend for ${pictures.length} series`.red);
    return;
  }

  cmd = cmd +
    `[full] fade=in:st=0:d=1 [fin]; `+
    `[fin] fade=out:st=${BOOKEND_DUR - 1}:d=1" `+
    `-t 00:00:15 ../bookends/bookend-${name}.mkv`;

  addToCommandQueue(`Bookend ${name}`, cmd);
}



function makeIntervalOverlay(name, events) {
  console.log("Creating interval overlay:".green, name.yellow);

  function drawEvent(event, index) {
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

function makeIntervalVideo(name, series, audioTrack) {
  console.log("Creating interval:".green, name.yellow);

  // series pictures
  let pictures = seriesPictures(series);

  // interval video
  let fadeDur = 2;
  let fadeOutStart = INTERVAL_DUR - fadeDur;

  let plateDur = 35;
  let plateOffset = 0.5;
  let plateFadeDur = 1.5;
  let plateEndBuf = 3;
  let plateStart = INTERVAL_DUR - plateEndBuf - plateDur;
  let plateEnd = INTERVAL_DUR - plateEndBuf;

  let eventsPlate = `../bookends/overlay-${name}.png`;

  let cmd = `ffmpeg -y -i "video/New Interval Base.mkv" `+
    `-i ${SHADOW255} -loop 1 `+
    `-i "${eventsPlate}" -loop 1 `+
    pictures.map((pic) => `-i "${pic}" `).join(" ")+
    `-i "${audioTrack}" `+
    `-filter_complex "`;

  let audioNum = pictures.length + 3;

  switch (pictures.length) {
  case 1:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [sh1]; ` +
      `[2:v] fps=fps=${FRAME_RATE},fade=out:st=${plateStart - plateFadeDur * 2}:d=${plateFadeDur}:alpha=1 [events]; ` +

      `[3:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [pic1]; `+

      `[0:v][sh1] overlay=510:327 [shadowed]; `+

      `[shadowed][pic1] overlay=515:327 [full]; `;
    break;

  case 2:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [sh1]; ` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [sh2]; ` +
      `[2:v] fps=fps=${FRAME_RATE},fade=out:st=${plateStart - plateFadeDur * 2}:d=${plateFadeDur}:alpha=1 [events]; ` +

      `[3:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [pic1]; `+
      `[4:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [pic2]; `+

      `[0:v][sh1] overlay=226:327 [in1]; `+
      `[in1][sh2] overlay=510:327 [shadowed]; `+

      `[shadowed][pic1] overlay=230:327 [in2]; `+
      `[in2][pic2] overlay=515:327 [full]; `;
    break;

  case 3:
    cmd = cmd +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [sh1]; ` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [sh2]; ` +
      `[1:v] fps=fps=${FRAME_RATE},scale=264x376,fade=in:st=${plateStart}:d=${plateFadeDur}:alpha=1 [sh3]; ` +
      `[2:v] fps=fps=${FRAME_RATE},fade=out:st=${plateStart - plateFadeDur * 2}:d=${plateFadeDur}:alpha=1 [events]; ` +

      `[3:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFadeDur}:alpha=1 [pic1]; `+
      `[4:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFadeDur}:alpha=1 [pic2]; `+
      `[5:v] fps=fps=${FRAME_RATE},scale=255x366,fade=in:st=${plateStart}:d=${plateFadeDur}:alpha=1 [pic3]; `+

      `[0:v][sh1] overlay=226:327 [in1]; `+
      `[in1][sh2] overlay=510:327 [in2]; `+
      `[in2][sh3] overlay=796:327 [shadowed]; `+

      `[shadowed][pic1] overlay=230:327 [in3]; `+
      `[in3][pic2] overlay=515:327 [in4]; `+
      `[in4][pic3] overlay=800:327 [full]; `;
      break;
  }

  cmd = cmd +
    `[full][events] overlay=0:600 [withevents]; `+

    `[withevents] fade=in:st=0:d=${fadeDur},fade=out:st=${fadeOutStart}:d=${fadeDur}" `+
    `-t 00:20:00 -sws_flags lanczos `+

    `-map "${audioNum}:a" `+
    `../bookends/interval-${name}.mkv`;

  console.log(cmd);

  addToCommandQueue(`Interval ${name}`, cmd);
}



function addToCommandQueue(name, cmd) {
  commandQueue.push({name, cmd});
}

function prependToCommandQueue(name, cmd) {
  commandQueue.unshift({name, cmd});
}


function runCommandQueue() {
  if (commandQueue.length == 0) {
    console.log("End of command queue".green);
    return;
  }

  let {name, cmd} = commandQueue.shift();
  console.log("Running command:".green, name);
  console.log(`<< ${cmd} >>`);

  exec(cmd, (err, stdout, stderr) => {
    if (err != null) {
      console.log("Error running command:".red, name, err);
    }

    runCommandQueue();
  });
}

module.exports = {
  makeBookendVideo,
  makeIntervalOverlay,
  makeIntervalVideo,
  addToCommandQueue,
  prependToCommandQueue,
  runCommandQueue
};
