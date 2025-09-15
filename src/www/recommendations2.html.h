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

  <title>Recommendations - Basingstoke Anime Society</title>
  <link rel="stylesheet" media="all" href="style.css?ver={{stylesheetVersion}}" />

  <meta name="description" content="Showing anime in Basingstoke every Tuesday" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{#if noindex}}<meta name="robots" content="noindex">{{/if}}

<script>
  var isHome = false;
  var isRecommendations = true;
  var isHistory = false;
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


<div class='lr'>
	<div>
		<header class="box top10pick">
			<h2>Recommendations</h2>
			<p>Need to find a new anime? Try one of our favourites.</p>
		</header>

		<div class="box top10pick">
			<p class='top10-genres top10-genres-big'>
				<a class='genre genre-first' data-genre='first'>New to anime</a>
				<a class='genre genre-number1' data-genre='number1'>Our #1s</a>
			</p>

			<hr>

			<p>Or pick a genre:</p>
			<p id='search-genres' class='top10-genres'>
				{{#each top10genres}}
				<a class='genre genre-{{slug this}}' data-genre='{{slug this}}'>{{this}}</a>
				{{/each}}
			</p>

			<hr>

			<p>Or pick a member's list:</p>
			<ul class='vpick'>
				{{#each top10}}
				<li>
					<a class='pick-list' id='pick-list-{{slug name}}{{#if code}}-{{slug code}}{{/if}}' data-list='{{slug name}}{{#if code}}-{{slug code}}{{/if}}'>
						<img src="images/avatars/{{slug name}}.png"><span>{{#if title}}{{title}}{{else}}{{name}}'s top 10 anime{{/if}}</span>
					</a>
				</li>
				{{/each}}
			</ul>
		</div>
	</div>

	<div id="top10results">
		<section class='top10 pick-pane pane' id='pick-pane-first' data-show='first'>
			<div class='box top10-genre-intro top10-genre-intro-first'>
				<h3>New to anime?</h3>
				<p>Try one of these great series first.</p>
			</div>

			<ul class='lre'>
			{{#each top10first}}
				<li class="box anime anime-genre-first">
					<img src="images/series/{{picture}}.png" class="top10-pic">
					<h4>{{name}}</h4>
					<div class="top10-genres">
					{{#each genre}}
						<a class="genre genre-{{slug this}}" data-genre='{{slug this}}'>{{this}}</a>
					{{/each}}
					</div>
				</li>
			{{/each}}
		</section>

		{{#each top10}}
		<section class='top10 pick-pane' id='pick-pane-{{slug name}}{{#if code}}-{{slug code}}{{/if}}' data-show='{{slug name}}{{#if code}}-{{slug code}}{{/if}}'>
			<ul class='lre'>
			{{#each anime}}
				<li class="box anime {{#each genre}} anime-genre-{{slug this}}{{/each}}{{#if (eq (inc @index) 1)}} anime-genre-number1{{/if}} anime-index-{{inc @index}}">
					<img src="images/series/{{picture}}.png" class="top10-pic">
					<div class="top10-index top10-index-{{inc @index}}"><img src="images/avatars/{{slug ../name}}.png"><span>#{{inc @index}}</span></div>
					<h4>{{name}}</h4>
					<div class="top10-genres">
					{{#each genre}}
						<a class="genre genre-{{slug this}}" data-genre='{{slug this}}'>{{this}}</a>
					{{/each}}
					</div>
				</li>
			{{/each}}
			</ul>
		</section>
		{{/each}}
	</div>
</div>

</main>

<div id='blanket'></div>

<aside id='map-overlay'>
  <div id='map-inner'>
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1248.3289793540373!2d-1.0825255249343884!3d51.26220677831826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xda797dee606b2fa8!2sThe%20White%20Hart!5e0!3m2!1sen!2suk!4v1580681206861!5m2!1sen!2suk"
      frameborder="0" style="border:0;" allowfullscreen=""></iframe>
    <a id='map-close' onclick="hideMap()">&times;</a>
  </div>
</aside>

<script src="script.js?ver={{ scriptVersion }}"></script>
</body>
