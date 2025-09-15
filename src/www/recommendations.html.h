<!DOCTYPE html>
<html>
<head>
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-157883376-1"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-157883376-1');
  </script>

  <title>Recommendations - Basingstoke Anime Society</title>
  <link rel="stylesheet" media="all" href="style.css?ver={{stylesheetVersion}}" />

  <meta name="description" content="Showing anime in Basingstoke every Tuesday" />
  <meta name="viewport" content="width=device-width, initial-scale=1">

<script>
  var isHome = false;
  var isRecommendations = true;
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

<header class="box">
<h2>Recommendations</h2>
<p>Need to find a new anime? Try one of our favourites.</p>
<p>Pick a genre:</p>
<p id='search-genres' class='top10-genres'>
	{{#each top10genres}}
	<a class='genre genre-{{slug this}}' data-genre='{{slug this}}'>{{this}}</a>
	{{/each}}
</p>
<a id='clear-genre'>Show All</a>
</header>

<div class='c3e'>
	{{#each top10}}
	<section class='top10'>
		<h3><img src="images/avatars/{{slug name}}.png">{{name}}'s Top 10</h3>

		<ul>
		{{#each anime}}
			<li class="box anime {{#each genre}} anime-genre-{{slug this}}{{/each}}">
				<img src="images/series/{{picture}}.png" class="top10-pic">
				<div class="top10-index"><img src="images/avatars/{{slug ../name}}.png"><span>#{{inc @index}}</span></div>
				<h4>{{name}}</h4>
				<div class="top10-genres">
				{{#each genre}}
					<span class="genre genre-{{slug this}}">{{this}}</span>
				{{/each}}
				</div>
			</li>
		{{/each}}
		</ul>
	</section>
	{{/each}}


	<!-- <div>

		<section class='box top10'>
			<h3><img src="">Blobberu's Top 10</h3>

			<ul>
				<li>
			</ul>
		</section>

		<section class='box top10'>
			<h3>Shrink Laureate's Top 10</h3>
		</section>
	</div>

	<div>
		<section class='box top10'>
			<h3>NoviceOtaku's Top 10</h3>
		</section>

		<section class='box top10'>
			<h3>Big Ed's</h3>
		</section>
	</div> -->
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

<script src="script.js"></script>
</body>
