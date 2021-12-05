const fs = require('fs');
const { exec } = require('child_process');

let args = process.argv.slice(2);

let series1picture = 'series/'+args[0]+'.png';
let series2picture = 'series/'+args[1]+'.png';

let date = args[2];

let shadow255 = "video/shadow255.png";

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


let cmd = `ffmpeg -y -i video/interval-base5.mkv -loop 1 -i ${series1picture} -loop 1 -i ${series2picture} -loop 1 -i ${shadow255} -c:a copy -filter_complex "`+

  `[1:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [s1];`+
  `[2:v] fps=fps=${frameRate},scale=255x366,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [s2];`+
  `[3:v] fps=fps=${frameRate},scale=265x376,fade=in:st=${plateStart-plateOffset*2}:d=${plateFade}:alpha=1 [sh1];` +
  `[3:v] fps=fps=${frameRate},scale=265x376,fade=in:st=${plateStart-plateOffset}:d=${plateFade}:alpha=1 [sh2];` +

  `[0:v][s1] overlay=710:327 [in1]; `+
  `[in1][s2] overlay=995:327 [in2]; `+

  `[in2][sh1] overlay=705:327 [in3]; `+
  `[in3][sh2] overlay=990:327 [in4]; `+

  `[in4] fade=out:st=${fadeStart}:d=${fade}" `+
  // `[in3] fade=in:0:60 [in4]; `+
  // `[in3] fade=out:35911:60" `+
  `-t 00:20:00 ../bookends/interval-${date}.mkv`;

console.log(cmd);

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err)
  } else {
  }
});