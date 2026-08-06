
// select a background image
function selectBackground() {
    var DAY_LIMIT = 5;
    var NIGHT_LIMIT = 7;

    var hour = new Date().getHours();
    var isDay = hour >= 6 && hour < 18;
    var bgNum = 1+Math.floor(Math.random() * (isDay ? DAY_LIMIT : NIGHT_LIMIT));
    var bg = (isDay ? "day-" : "night-")+bgNum;

    if (isDay) {
      document.body.classList.add('day');
      document.body.classList.remove('night');
    } else {
      document.body.classList.add('day');
      document.body.classList.remove('night');
    }

    document.body.setAttribute('bg', bg);
}

setInterval(selectBackground, 300000); // 5 minutes
