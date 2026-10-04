const fs = require('fs');
const { exec } = require('child_process');

const videoUtil = require('./make/video-util.js');

let args = process.argv.slice(2);
let [ series1, name ] = args;

let series = [
  {
    picture: series1
  }
];

videoUtil.makeBookendVideo(name, series);

videoUtil.runCommandQueue();
