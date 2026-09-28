const fs = require('fs');
const { exec } = require('child_process');

const videoUtil = require('./video-util.js');






let args = process.argv.slice(2);

let series1picture = 'series/'+args[0]+'.png';

let date = args[1];

// let shadow315 = "video/shadow315.png";

// let frameRate = 29.976;
// let bookendDur = 15;

// let plateOffset = 0.5;
// let plateFade = 1.5;
// let plateStart = 2;

// let cmd = `ffmpeg -y -i video/bookend-base.mkv -loop 1 -i ${series1picture} -loop 1 -i ${shadow315} -an `+
//   `-filter_complex "`+

//   `[1:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
//   `[2:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +

//   `[0:v][s1] overlay=505:135 [in1]; `+

//   `[in1][sh1] overlay=500:135 [in2]; `+

//   `[in2] fade=in:st=0:d=1 [in3]; `+
//   `[in3] fade=out:st=14:d=1" `+
//   `-t 00:00:15 ../bookends/bookend-${date}.mp4`;

console.log(cmd);

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err)
  } else {
  }
});
