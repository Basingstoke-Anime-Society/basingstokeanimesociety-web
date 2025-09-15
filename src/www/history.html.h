<!DOCTYPE html>
<html>
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5ZYQSZM09J"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-5ZYQSZM09J');
</script>

  <title>History - Basingstoke Anime Society</title>
  <link rel="stylesheet" media="all" href="style.css?ver={{stylesheetVersion}}" />

  <meta name="description" content="Showing anime in Basingstoke every Tuesday" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{#if noindex}}<meta name="robots" content="noindex">{{/if}}

<script>
  var isHome = false;
  var isRecommendations = false;
  var isHistory = true;
</script>
</head>
<body class="day recommendations-page">

<div id='section-logo'>
<img src='images/logo.png' id='logo'>
</div>

<nav id='section-social'>
<a class='btn btn-mail' href='mailto:marcus@basingstokeanimesociety.com'><i></i><span>Mail</span></a>
<a class='btn btn-discord' href='https://discord.gg/sypjyaA' target="_blank"><i></i><span>Discord</span></a>
</nav>

<main>

<h1 id='main-title'>Basingstoke Anime Society</h1>

<a id='home-link' href='/'><img src='images/back.png'> Home</a>




<nav class='tabs'>
<a class='tab tab--show' data-tab='history'>History</a>
<a class='tab' data-tab='episodes'>Episodes</a>
</nav>

<div class='tab-panes'>
<section class='tab-pane tab-pane--show' data-tab='history'>

  <div class='lr'>
  	<div>
  		<header class="box">
  			<h2>History</h2>
        <p>Basingstoke Anime Society started on Tuesday 12th September 2006, and has run almost every Tuesday since.</p>
  			<p>We've shown some great anime over the years.</p>
  		</header>

  		<div class="box historyPick">
  			<p>
  				<a class='pick pick--show' data-pane-set='history' data-show='recent'>Recent</a>
  			</p>

  			<hr>

        {{#each historyYears}}
        <p><a class='pick' data-pane-set='history' data-show='{{this}}'>{{this}}</a></p>
        {{/each}}
        {{#each ancient_history}}
        <p><a class='pick' data-pane-set='history' data-show='{{name}}'>{{name}}</a></p>
        {{/each}}
  		</div>
  	</div>

  	<div id="history-results" class="pane-set" data-pane-set='history'>
      {{#each ancient_history}}
      <div class='history-tab-pane pane' data-pane='{{name}}'>
        <div class="series-grid">
          {{#each anime}}
            {{> anime this}}
          {{/each}}
        </div>
      </div>
      {{/each}}
    </div>
  </div>
</section>

<section class='tab-pane' data-tab='episodes'>
  <div class="rl">
    <header class='box'>
      <h2>Episodes</h2>
      <p>If you missed a week, here are the episodes we showed.</p>
    </header>
  </div>

  <div id='history-episode-list'></div>
</section>

<section class='tab-pane' data-tab='future'>
  <div class="rl">
    <header class='box'>
      <h2>Future</h2>
      <p>Sneaky preview!</p>
    </header>
  </div>

  <div id='history-future-list'></div>
</section>

</main>

<div id='blanket'></div>

<script src="script.js?ver={{ scriptVersion }}"></script>
</body>
