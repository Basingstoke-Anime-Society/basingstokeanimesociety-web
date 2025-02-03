const _ = require('lodash');

const util = require('./util.js');

function flowEpisodes(series, skipWeeks) {
  let directives = _.has(series, "episodes") ? series.episodes : [];
  let start = 1;
  let end = _.has(series, "count") ? series.count : (series.movie ? 1 : 0);

  // get the episode number range
  for (let directive of directives) {
    // start episode numbers with something other than 1
    if (_.has(directive, "start")) {
      start = directive.start;
    }

    // end the series here
    if (_.has(directive, "end")) {
      end = directive.end
    }
  }
  console.log(series.name, "Episodes", start, "to", end);

  // make an episode list
  let episodes = []
  for (let number = start; number <= end; number++) {
    episodes.push({
      episode: number
    });
  }

  // adjust or insert extra episodes where needed
  for (let directive of directives) {
    if (_.has(directive, "episode")) {
      if (_.has(directive, "before")) {
        // insert before a given episode
        let index = episodes.findIndex((ep) => ep.episode == directive.before);
        episodes.splice(index, 0, directive);
      } else if (_.has(directive, "after")) {
        // insert after a given episode
        let index = episodes.findIndex((ep) => ep.episode == directive.after) + 1;
        episodes.splice(index, 0, directive);
      } else {
        // don't insert, adjust an existing episode
        let index = episodes.findIndex((ep) => ep.episode == directive.episode);
        let episode = {...episodes[index], ...directive};
        episodes.splice(index, 1, directive);
      }
    }
  }
  series.episodes = episodes;
  console.log(series.name, "Episode flow, adjusted:", episodes);
  
  // flow by week
  if (episodes.length > 0) {
    let weeks = [];
    let weekDate = series.from;
    let currentWeek = {
      week: weekDate,
      episodes: []
    };
    weeks.push(currentWeek);

    let weekFull = false;
    for (let episode of episodes) {
      if (episode.show == 'skip') {
        continue;
      }

      if (_.has(episode, "delayto")) {
        let delayto = new Date(episode.delayto);
        console.log(series.name, episode.episode, "delay to", delayto);
        if (delayto > weekDate) {
          // console.log(series.name, episode.episode, "delay: set week to", delayto);
          weekDate = delayto;
          currentWeek = {week: weekDate, episodes: []};
          weeks.push(currentWeek);
          weekFull = false;
          // console.log(series.name, episode.episode, "delay: new week", currentWeek);
        }
      }

      if (weekFull) {
        weekDate = util.plus1week(weekDate);
        while (skipWeeks.includes(weekDate)) {
          weekDate = util.plus1week(weekDate);
        }
        currentWeek = {week: weekDate, episodes: []};
        weeks.push(currentWeek);
        weekFull = false;
      }
      currentWeek.episodes.push(episode);
      if (episode.show == 'single' || (currentWeek.episodes.length >= 2 && episode.show != 'more')) {
        weekFull = true;
      }
    }

    // console.log(series.name, "Weeks DATES???:", JSON.stringify(weeks, null, 2));
    for (let week of weeks) {
      week.week = util.formatShortDate(week.week);
    }

    series.weeks = weeks;
    console.log(series.name, "Weeks:", JSON.stringify(weeks, null, 2));
  }

  return series;
}

function simplifySeries(series) {
  return {
    name: series.name,
    from: series.from,
    picture: series.picture,
    rating: series.rating,
  };
}

function episodeList2str(episodes) {
  return episodes.map((ep) => ep.episode).join(", ");
}

function makeEpisodeList(slot1, slot2, slot3, skipWeeks) {
  // flow episodes in all three slots
  slot1 = util.recentAndFuture(slot1).map((series) => flowEpisodes(series, skipWeeks));
  slot2 = util.recentAndFuture(slot2).map((series) => flowEpisodes(series, skipWeeks));
  slot3 = util.recentAndFuture(slot3).map((series) => flowEpisodes(series, skipWeeks));

  console.log("Slot 1 series", slot1);
  console.log("Slot 2 series", slot2);
  console.log("Slot 3 series", slot3);

  let slot1weeks = {};
  let slot2weeks = {};
  let slot3weeks = {};

  let lastDate = new Date(Date.now());

  for (let series of slot1) {
    if (series.weeks) {
      for (let week of series.weeks) {
        slot1weeks[week.week] = {series: simplifySeries(series), episodes: episodeList2str(week.episodes)};
        let date = new Date(week.week);
        if (date > lastDate) {
          lastDate = date;
        }
      }
    }
  }

  for (let series of slot2) {
    if (series.weeks) {
      for (let week of series.weeks) {
        slot2weeks[week.week] = {series: simplifySeries(series), episodes: episodeList2str(week.episodes)};
        let date = new Date(week.week);
        if (date > lastDate) {
          lastDate = date;
        }
      }
    }
  }

  for (let series of slot3) {
    if (series.weeks) {
      for (let week of series.weeks) {
        slot3weeks[week.week] = {series: simplifySeries(series), episodes: episodeList2str(week.episodes)};
        let date = new Date(week.week);
        if (date > lastDate) {
          lastDate = date;
        }
      }
    }
  }
  console.log("Last date:", lastDate);

  console.log("Slot 1 weeks", slot1weeks);
  console.log("Slot 2 weeks", slot2weeks);
  console.log("Slot 3 weeks", slot3weeks);

  // make the schedule
  let schedule = {};
  let firstDate = util.firstTuesdayFrom(util.recentDateCutoff());
  for (let date = firstDate; date < lastDate; date = util.plus1week(date)) {
    let week = util.formatShortDate(date);
    schedule[week] = {
      displayDate: util.formatLongDate(date),
      date: date,
      slot1: slot1weeks[week],
      slot2: slot2weeks[week],
      slot3: slot3weeks[week],
    };
    console.log(week, schedule[week]);
  }

  return schedule;
}

module.exports = {
  flowEpisodes,
  makeEpisodeList
}
