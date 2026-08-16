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

  <title>Anniversary BBQ - Basingstoke Anime Society</title>
  <link rel="stylesheet" media="all" href="style.css?ver={{stylesheetVersion}}" />

  <meta name="description" content="Showing anime in Basingstoke every Tuesday" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {{#if noindex}}<meta name="robots" content="noindex">{{/if}}

<!-- Twitter universal website tag code -->
<script>
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
// Insert Twitter Pixel ID and Standard Event data below
twq('init','o898i');
twq('track','PageView');
</script>
<!-- End Twitter universal website tag code -->

<script>
  var isHome = false;
  var isRecommendations = false;
</script>

</head>
<body class="day home-page">

<div id='section-logo'>
<img src='images/logo.png' id='logo'>
</div>

<nav id='section-social'>
<a class='btn btn-mail' href='mailto:marcus@basingstokeanimesociety.com'><i></i><span>Mail</span></a>
<a class='btn btn-twitter' href='https://twitter.com/BasingAnime' target="_blank"><i></i><span>Twitter</span></a>
<a class='btn btn-fb' href='https://www.facebook.com/groups/basingstokeanimesociety/' target="_blank"><i></i><span>Facebook</span></a>
<a class='btn btn-discord' href='https://discord.gg/sypjyaA' target="_blank"><i></i><span>Discord</span></a>
</nav>

<main>

<h1 id='main-title'>Basingstoke Anime Society</h1>

<a id='home-link' href='/'><img src='images/back.png'> Home</a>

<section class='box'>
  <h2>Basingstoke Anime Society</h2>
  <h3 class='big'>16th Anniversary BBQ</h3>
</section>

<header id="header">
  <div>
    <section class="box">

      <article id="next-social-date" class="focus-date event-social">
        <time datetime="{{ nextSocial.date }}"><span class='day'>17</span><span class='month'>SEP</span></time>
        <div class="next-social-side focus-date-side">Saturday</div>
      </article>

      <p>All day: 1pm to 10pm</p>

    </section>

    <section class="box">
      <h2>Food</h2>
      <p>Bring your own food for us to BBQ, or join our Kezie order.</p>
      <a class="btn" href="https://www.keziefoods.co.uk/">Kezie</a>
      <hr>
      <p>All you can eat cake buffet</p>
    </section>

    <section class="box">
      <h2>Entertainment</h2>
      <p>Quiz</p>
      <p>Raffle</p>
      <p>Games</p>
    </section>
  </div>

  <div>
    <section class="box">
      <h2>Venue</h2>

      <h3 class="big">Northington &amp; Swarraton Village Hall</h3>

      <p>Northington, Alresford SO24 9TH</p>
    </section>

    <section class="slideshow">
      <div class="slideshow-slider">
        <div class="row">
          <img src="images/bbq/1.jpg">
          <img src="images/bbq/2.jpg">
        </div>
        <div class="row">
          <img src="images/bbq/3.jpg">
          <img src="images/bbq/4.jpg">
        </div>
      </div>
    </section>
  </div>
</header>



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
