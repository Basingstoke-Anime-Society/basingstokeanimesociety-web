const fs = require('fs');
const { exec } = require('child_process');
const videoUtil = require('./make/video-util.js');

let args = process.argv.slice(2);
let [ series1, series2, series3, name ] = args;

let series = [
  {
    picture: series1
  },
  {
    picture: series2
  },
  {
    picture: series3
  }
];

videoUtil.makeBookendVideo(name, series);

videoUtil.runCommandQueue();


// let args = process.argv.slice(2);

// let series1picture = 'series/'+args[0]+'.png';
// let series2picture = 'series/'+args[1]+'.png';
// let series3picture = 'series/'+args[2]+'.png';

// console.log(series3picture);

// let date = args[3];

// let shadow315 = "video/shadow315.png";

// let frameRate = 29.976;
// let bookendDur = 15;

// // let plateDur = 35;
// let plateOffset = 0.5;
// let plateFade = 1.5;
// // let plateEndBuf = 3;
// let plateStart = 2;

// let cmd = `ffmpeg -y -i video/bookend-base.mkv -loop 1 -i ${series1picture} -loop 1 -i ${series2picture} -loop 1 -i ${series3picture} -loop 1 -i ${shadow315} -an `+
//   `-filter_complex "`+

//   `[1:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
//   `[2:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [s2];`+
//   `[3:v] fps=fps=${frameRate},fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [s3];`+
//   `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
//   `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +
//   `[4:v] fps=fps=${frameRate},fade=in:st=${plateStart}:d=${plateFade}:alpha=1 [sh3];` +

//   `[0:v][s1] overlay=205:135 [in1]; `+
//   `[in1][s2] overlay=555:135 [in2]; `+
//   `[in2][s3] overlay=905:135 [in3]; `+

//   `[in3][sh1] overlay=200:135 [in4]; `+
//   `[in4][sh2] overlay=550:135 [in5]; `+
//   `[in5][sh3] overlay=900:135 [in6]; `+

//   `[in6] fade=in:st=0:d=1 [in7]; `+
//   `[in7] fade=out:st=14:d=1" `+
//   `-t 00:00:15 ../bookends/bookend-${date}.mp4`;

// console.log(cmd);

// exec(cmd, (err, stdout, stderr) => {
//   if (err) {
//     //some err occurred
//     console.error(err)
//   } else {
//   }
// });
