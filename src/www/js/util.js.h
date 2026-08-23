
function slugify(str) {
  str = str.toLowerCase();
  str = str.replace("'", "");
  str = str.replace(/ \(.*\)/, '');
  str = str.split(/[ _/-]+/).join('-');
  return str;
}

function pickTab(code) {
  let leftcode = {
    "coming-soon": ["history"],
    "news": ["coming-soon"],
    "recommendations": ["coming-soon", "news"],
    "history": ["news", "recommendations"],
    "episodes": ["history"],
    "future": []
  }[code];

  let rightcode = {
    "coming-soon": ["news", "recommendations"],
    "news": ["recommendations", "history"],
    "recommendations": ["history"],
    "history": ["coming-soon", "episodes"],
    "episodes": [],
    "future": []
  }[code];

  // switch tabs
  for (let tab of document.getElementsByClassName('tab')) {
    if (tab.dataset.tab == code) {
      tab.classList.add('tab--show');
    } else {
      tab.classList.remove('tab--show');
    }
  }

  // switch tab panes
  for (let pane of document.getElementsByClassName('tab-pane')) {
    if (pane.dataset.tab == code) {
      pane.classList.add('tab-pane--show');
    } else {
      pane.classList.remove('tab-pane--show');
    }

    if (leftcode.includes(pane.dataset.tab)) {
      pane.classList.add('tab-pane--shift-left');
    } else {
      pane.classList.remove('tab-pane--shift-left');
    }

    if (rightcode.includes(pane.dataset.tab)) {
      pane.classList.add('tab-pane--shift-right');
    } else {
      pane.classList.remove('tab-pane--shift-right');
    }
  }
}

function pickPane(paneset, show) {
  for (let picklink of document.querySelectorAll(`.pick[data-pane-set='${paneset}']`)) {
    if (picklink.dataset.show == show) {
      picklink.classList.add('pick--show');
    } else {
      picklink.classList.remove('pick--show');
    }
  }

  for (let panesetdiv of document.querySelectorAll(`.pane-set[data-pane-set='${paneset}']`)) {
    for (let pane of panesetdiv.getElementsByClassName('pane')) {
      if (pane.dataset.pane == show) {
        pane.classList.add('pane--show');
      } else {
        pane.classList.remove('pane--show');
      }
    }
  }
}

function setupTabs(auto = false) {
  var autoInterval = null;
  var tabCodes = [];

  // tabs
  for (let tab of document.getElementsByClassName('tab')) {
    let code = tab.dataset.tab;
    tabCodes.push(code);
    ((code) => {
      tab.addEventListener('click', (evt) => {
        // stop auto-flipping when the user clicks
        if (autoInterval != null) {
          clearInterval(autoInterval);
          autoInterval = null;
        }

        pickTab(code);
      });
    })(code);
  }

  // auto step from one tab to the next, until they click
  if (auto) {
    var nextAuto = 1;
    autoInterval = setInterval(() => {
      console.log("Next interval:", nextAuto, tabCodes[nextAuto]);
      let code = tabCodes[nextAuto++];
      if (nextAuto >= tabCodes.length) {
        nextAuto = 0;
      }

      pickTab(code);
    }, 8000);
  }

  // pick panes
  for (let picklink of document.getElementsByClassName('pick')) {
    let paneset = picklink.dataset.paneSet;
    let show = picklink.dataset.show;
    ((paneset, show) => {
      picklink.addEventListener('click', (evt) => {
        // stop auto-flipping when the user clicks
        if (autoInterval != null) {
          clearInterval(autoInterval);
          autoInterval = null;
        }

        pickPane(paneset, show);
      });
    })(paneset, show);
  }

  // tabs in URL
  if (window.location.hash) {
    let match = window.location.hash.match(/tab=(.*)/);
    if (match !== null) {
      pickTab(match[1]);
      clearInterval(autoInterval);
    }
  }
}
