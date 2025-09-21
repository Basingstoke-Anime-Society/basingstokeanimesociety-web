{{> data_js }}
{{> util_js }}
{{> template_js }}
{{> home_js }}
{{> recommendations_js }}
{{> history_js }}
{{> voting_js }}

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

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

window.onload = function () {
  if (isHome) {
    setupHome();
  }

  if (isRecommendations) {
    setupRecommendations();
  }

  if (isHistory) {
    setupHistory();
  }

  setupVoting();

  setupSlideshow();
  setupTabs(true);

  // add hover on all the rating symbols
  function addRatingHover(item) {
    var img = item.getElementsByClassName("rating-img")[0];
    var hover = item.getElementsByClassName("rating-hover")[0];
    var tag = item.getElementsByClassName("rating__tag")[0];

    if (img === undefined) {
      return;
    }

    img.addEventListener("mouseover", function(event) {
      hover.classList.add("rating-hover--show");

      var imgbox = img.getBoundingClientRect();
      var hoverbox = hover.getBoundingClientRect();

      var left = imgbox.left - hoverbox.left + 17;
      tag.style.left = left+"px";
    });
    img.addEventListener("mouseout", function(event) {
      hover.classList.remove("rating-hover--show");
    });
  }

  var ratingElements = document.getElementsByClassName('rating');
  for (var item of ratingElements) {
    addRatingHover(item);
  }

  selectBackground();
};
setInterval(selectBackground, 300000); // 5 minutes

function expandComingSoon() {
  let elem = document.getElementById('coming-soon');
  if (elem !== null) {
    elem.classList.remove('coming-soon--less');
    elem.classList.add('coming-soon--more');
  }
}

function setupSlideshow() {
  for (let slideshow of document.getElementsByClassName('slideshow')) {
    (function (slideshow) {
      let pos = 1;
      setInterval(function () {
        slideshow.classList.remove('pos'+pos);
        pos++;
        if (pos > 4) {
          pos -= 4;
        }
        slideshow.classList.add('pos'+pos);
      }, 3000);
    })(slideshow);
  }
}

function showMap() {
  document.getElementById('blanket').className = "hide";
  document.getElementById('map-overlay').className = "hide";
  setTimeout(() => {
    document.getElementById('blanket').className = "show";
    document.getElementById('map-overlay').className = "show";
  }, 1);
}

function showNews() {
  document.getElementById('news-more-switch').className = "hide";
  document.getElementById('news-more').className = "show";
}

function hideMap() {
  document.getElementById('blanket').className = "hide";
  document.getElementById('map-overlay').className = "hide";
  setTimeout(() => {
    document.getElementById('blanket').className = "";
    document.getElementById('map-overlay').className = "";
  }, 500);
}
