
var now = new Date(Date.now());
var currentSlot1, currentSlot2, currentSlot3;

function setupHome() {
  var yesterday = new Date(Date.now());
  yesterday.setDate(yesterday.getDate() - 1);

  // adjust the events list
  let futureEvents = events.filter(function (event) {
    return Date.parse(event.date) > yesterday;
  }).slice(0, {{ maxEvents }});

  setupHomeNextMeeting(futureEvents);
  setupHomeNowShowing();
  setupHomeComingSoon();
  setupHomeEventsList(futureEvents);
  setupHomeNews();
  setupHomeRecommendations();
  setupHomeEpisodeHistory();
}

function formatEventDateTime(event, name, tagline) {
  return `<time datetime='${event.date}'>
    <span class='day'>${event.day}</span>
    <span class='month'>${event.month}</span>
    <span class='year'>${event.year}</span>
  </time>
  <div class='focus-date-side'>
    <span class='next-social-title'>${name}</span>
    <br>${tagline}
  </div>`;
}

function setupHomeNextMeeting(events) {
  var meetings = [];
  var social = [];
  var online = [];
  for (var event of events) {
    for (ev of event.events) {
      switch (ev.class) {
        case 'anime':
          meetings.push(ev);
          break;

        case 'social':
        case 'cinema':
          social.push(ev);
          break;

        case 'online':
          online.push(ev);
          break;
      }
    }
  }

  // next main meeting
  var nextMeeting = meetings[0];
  
  document.getElementById('next-meeting-date').innerHTML = 
    `<time datetime='${nextMeeting.date}'>
      <span class='day'>${nextMeeting.day}</span>
      <span class='month'>${nextMeeting.month}</span>
      <span class='year'>${nextMeeting.year}</span>
    </time>
    <div class='next-meeting-side focus-date-side'>
      ${nextMeeting.weekday}<br>${nextMeeting.time}
    </div>`;
  // document.getElementById('next-meeting-title').innerHTML = (nextEvent.name == 'Anime Society Meeting' ? '' : nextEvent.name);
  if (document.getElementById('next-meeting-venue')) {
    document.getElementById('next-meeting-venue').innerHTML = nextMeeting.venue;
  }
  if (document.getElementById('next-meeting-address')) {
    document.getElementById('next-meeting-address').innerHTML = nextMeeting.address;
  }

  // next social
  if (social.length > 0) {
    var nextSocial = social[0];

    document.getElementById('next-social-date').innerHTML = formatEventDateTime(nextSocial, nextSocial.name, nextSocial.weekday + " " + nextSocial.time);
    if (document.getElementById('next-social-venue')) {
      document.getElementById('next-social-venue').innerHTML = nextSocial.venue;
    }
    if (document.getElementById('next-social-address')) {
      document.getElementById('next-social-address').innerHTML = nextSocial.address;
    }
  } else {
    document.getElementById('section-next-social').remove();
  }

  // next online
  if (online.length > 0) {
    var nextOnline = online[0];

    document.getElementById('next-online-date').innerHTML = formatEventDateTime(nextOnline, nextOnline.name, nextOnline.time);
  } else {
    document.getElementById('section-next-online').remove();
  }
}

function setupHomeNowShowing() {

  // adjust the showing anime
  function showingAnime(slot) {
    var before = slot.filter(function (series) {
      var from = series.hasOwnProperty('displayFrom') ? series.displayFrom : series.from;
      return Date.parse(from) < now;
    });
    return before[before.length - 1];
  }

  currentSlot1 = showingAnime(slot1);
  currentSlot2 = showingAnime(slot2);
  currentSlot3 = showingAnime(slot3);

  function editSlot(id, series) {
    if (series.name == "") {
      document.getElementById(id).classList.add('hide');
      return;
    }

    document.getElementById(id+'name').innerHTML = '<p class="series-ident">'+(series.movie ? 'Movie' : 'Series')+'</p>'+series.name;
    var img = document.getElementById(id+'picture');
    img.setAttribute('src', 'images/series/'+series.picture+'.png');
    img.classList.add("show");

    var slotDate = document.getElementById(id+'date');
    if (slotDate !== null) {
      slotDate.innerHTML = "<span class='day'>"+series.day+"</span><span class='month'>"+series.month+"</span>";
    }

    if (series.movie) {
      document.getElementById(id).classList.add('movie');
    }

    if (series.rating) {
      document.getElementById(id+'rating').innerHTML = `<img class='rating-img rating-${series.rating}' src='images/rating/${series.rating}.svg'>` +
        `<div class='rating-hover rating-hover-${series.rating}'><span>Age rating: ${ratingText[series.rating]}</span><div class='rating__tag'></div></div>`;
    }
  }

  editSlot('slot1', currentSlot1);
  editSlot('slot2', currentSlot2);
  editSlot('slot3', currentSlot3);
}

// adjust the coming soon list
function futureN(items, number) {
  var after = items.filter(function(item) {
    return Date.parse(item.date) >= now;
  });
  return after.slice(0, number);
}

function excludeSeries(items, exclude) {
  let excludeNames = exclude.map(function (item) {
    return item.name;
  });
  return items.filter(function (item) {
    return !excludeNames.includes(item.name);
  });
}

function setupHomeComingSoon() {
  // var rowCutoffs = {1: 2, 2: 5, 3: 8, 4: 11};
  // function findCutoff(items, maxRow) {
  //   for (var row = maxRow; row > 1; row--) {
  //     var cutoff = rowCutoffs[row];
  //     if (items >= cutoff)
  //       return cutoff;
  //   }
  //   return rowCutoffs[1];
  // }

  comingSoon = futureN(comingSoon, 16);
  comingSoon = excludeSeries(comingSoon, [currentSlot1, currentSlot2, currentSlot3]);
  comingSoon = futureN(comingSoon, 12);

  var comingSoonHTML = '';
  for (let item of comingSoon) {
    if (item.noCalendar)
      continue;
    var isMovie
    var html = template_series(item, {
      isNew: true,
      showDate: true,
      showRating: true,
      large: item.movie
    });
    comingSoonHTML = comingSoonHTML + html;
  }
  document.getElementById('coming-soon').innerHTML = comingSoonHTML;

  if (comingSoon.length <= 2) {
    document.getElementById('coming-soon').classList.add('coming-soon--very-short');
  } else if (comingSoon.length <= 5) {
    document.getElementById('coming-soon').classList.add('coming-soon--short');
  }
}

function setupHomeEventsList(futureEvents) {
  var eventsHTML = '';
  for (var event of futureEvents) {
    let partEvents = event.events.filter((evt) => !evt.hide);
    if (partEvents.length == 0) {
      continue;
    }

    var html = 
      `<article id='upcoming-${event.date}' class='event event-${event.class}'>
        <time datetime='${event.date}'>
          <span class='day'>${event.day}</span>
          <span class='month'>${event.month}</span>
          ${event.special ? "<span class='time__special'></span>" : ""}
        </time>\n`;
    for (ev of partEvents) {
      var time = false;
      var a = "";
      var _a = "";
      if (ev.hasOwnProperty("link")) {
        a = "<a href='"+ev.link+"'>";
        _a = "</a>";
      }
      html = html + "<div class='event-detail event-detail-"+ev.class+"'>";
      if (ev.hasOwnProperty("picture") && ev.picture != "") {
        html = html + "<img src='images/series/"+ev.picture+".png'>";
      }
      if (ev.hasOwnProperty("prename") && ev.prename != "") {
        html = html + "<p class='series-ident'>"+ev.prename+"</p>";
      }
      html = html + "<h3>"+ev.name+"</h3>\n";
      if (ev.hasOwnProperty("time") || (ev.hasOwnProperty("venue") && ev.venue)) {
        html = html+"<p>"+a;
        if (ev.hasOwnProperty("venue") && ev.venue) {
          html = html + ev.venue;
          if (ev.hasOwnProperty("time")) {
            html = html + ", ";
            if (ev.hasOwnProperty("shortWeekday")) html = html + ev.shortWeekday + " ";
            html = html + ev.time;
          }
        } else {
          if (ev.hasOwnProperty("shortWeekday")) html = html + ev.shortWeekday + " ";
          html = html+ev.time;
        }

        html = html+_a+"</p>\n";
      }
      if (ev.price) {
        html = html + "<p>Club fee: "+ev.price+"</p>";
      }
      html = html+"</div>";
    };
    html = html + "</article>\n";
    eventsHTML = eventsHTML + html;
  }
  document.getElementById('events-list').innerHTML = eventsHTML;
}

function setupHomeNews() {
  try {
    fetch("/news.html").then((response) => {
      return response.text();
    }).then((html) => {
      document.getElementById('news-area').innerHTML = html;
    });
  } catch (e) {
    console.error("Error fetching news:", e);
  }
}

function setupHomeRecommendations() {
  // pick a random recommendation
  console.log('Recommendations: '+top10.length+' items');
  // let index = Math.floor(Math.random() * top10.length);
  let rec_names = [];
  let rec_anime = [];
  for (let i = 0; i < 10 && rec_anime.length < 3; i++) {
    let series = top10[Math.floor(Math.random() * top10.length)];
    if (rec_names.includes(series.name))
      continue;
    rec_anime.push(series);
    rec_names.push(series.name);
  }
  console.log('Recommendations:', rec_anime);

  let first = 1;
  let html = rec_anime.map((series) => {
    return template_series(series, {
      prefix: "You may enjoy...",
      // large: (first--) > 0,
      showGenres: true,
    });
  }).join("");

  document.getElementById('home-recommendations').innerHTML = html;
}

function setupHomeEpisodeHistory() {
  console.log('All anime:', allAnime.length, 'shows');
  let pastAnime = allAnime.filter((series) => {
    let date = new Date(series.from);
    return date <= now &&
      series.name != currentSlot1.name &&
      series.name != currentSlot2.name &&
      series.name != currentSlot3.name;
  });

  console.log('Past anime:', pastAnime.length, 'shows');
  let recentAnime = pastAnime.slice(pastAnime.length - 8);
  recentAnime.reverse();
  console.log('Recent anime', recentAnime);

  let historyHtml = '';
  for (let series of recentAnime) {
    var html = template_series(series, {
      prefix: "We recently watched...",
      showGenres: true,
      // info: series.month,
    });
    historyHtml = historyHtml + html;
  }

  document.getElementById('history').innerHTML = historyHtml;
}
