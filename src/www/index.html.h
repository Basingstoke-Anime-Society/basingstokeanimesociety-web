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

  <title>Basingstoke Anime Society</title>
  <link rel="stylesheet" media="all" href="style.css?ver={{stylesheetVersion}}" />

  <meta name="description" content="Showing anime in Basingstoke every Tuesday" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="last-modified" content="{{lastModified}}">
  {{#if noindex}}<meta name="robots" content="noindex">{{/if}}

<script>
  var isHome = true;
  var isRecommendations = false;
</script>

</head>
<body class="day home-page">

<div id='section-logo'>
<img src='images/logo.png' id='logo'>
</div>

<nav id='section-social'>
<a class='btn btn-mail' href='mailto:marcus@basingstokeanimesociety.com'><i></i><span>Mail</span></a>
<a class='btn btn-discord' href='https://discord.gg/sypjyaA' target="_blank"><i></i><span>Discord</span></a>
</nav>

<main>

<h1 id='main-title'>Basingstoke Anime Society</h1>

<header id="header">
<div>
  <!-- <section class='box'>
    <h3 class='big'>Showing anime in Basingstoke every Tuesday.</h3>
  </section> -->

  <section id='section-next-meeting' class='box'>
    <h2>Next Weekly Meeting</h2>

    <article id="next-meeting-date" class="focus-date event-anime">
      <time datetime="{{ date }}"><span class='day'>{{ day }}</span><span class='month'>{{ month }}</span></time>
      <div class="next-meeting-side focus-date-side">Tuesday<br>7pm</div>
    </article>

    <div style='position: relative'>
    <!-- {{#if (eq nextMeetingVenue 'Discord')}}
    <a class='float-right btn btn-discord' href='https://discord.gg/sypjyaA' style='top: -15px; right: 0'><i></i><span>Join our Discord</span></a>
    {{/if}} -->

    <!-- <h3>Venue: <span id="next-meeting-venue">{{ nextMeetingVenue }}</span></h3> -->
    </div>

    <!-- <hr> -->

    <div id='about'>
      <button class='btn btn-where-when' onclick="showMap()"><i></i><span>Show Map</span></button>

      <div class='content'>
        <p><img class='icon' src='images/pin.svg'>Function room, upstairs at <a href='https://www.thewhitehartbasingstoke.com/'>The White Hart</a>, Basingstoke RG21 4AE</p>
        <p><span class='icon entry-fee'>£4</span>Club fee</p>
        <!-- <p><img class='icon' src='images/biohazard-white.svg'>Vaccination required</p> -->
        <p><img class="rating-img rating-18 icon" src="images/rating/18.svg">Age requirement</p>
      </div>
    </div>
  </section>
</div>

<div>
  <section class='box'>
    <h3 class='big'>Showing anime in Basingstoke every Tuesday.</h3>
  </section>

  <section id='section-next-social' class='box'>
    <h2>Next Social Event</h2>

    <article id="next-social-date" class="focus-date event-social">
      <time datetime="{{ nextSocial.date }}"><span class='day'></span><span class='month'></span></time>
      <div class="next-social-side focus-date-side"><br></div>
    </article>

    <h3>Venue: <span id="next-social-venue">{{ nextSocialVenue }}</span></h3>
  </section>
</div>
</header>

<section id='section-now-showing' class='{{#if options.hiatus}}section-now-showing-hiatus{{/if}}'>
  <h2 class='underline'>Now Showing</h2>

  <div id='now-showing'>
    <figure id='slot1'>
      <figcaption id='slot1name'></figcaption>
      <img class='series-picture' id='slot1picture' src=''>
      <div class='rating' id='slot1rating'></div>
    </figure>

    <figure id='slot2'>
      <figcaption id='slot2name'></figcaption>
      <img class='series-picture' id='slot2picture' src=''>
      <div class='rating' id='slot2rating'></div>
    </figure>

    <figure id='slot3'>
      <figcaption id='slot3name'></figcaption>
      <img class='series-picture' id='slot3picture' src=''>
      <div class='rating' id='slot3rating'></div>
    </figure>
  </div>

  <h2 class='underline'>Coming Soon</h2>

  <div id='coming-soon' class='coming-soon--less'>
  </div>

  <div id='coming-soon-more-switch'>
    <button class='btn btn-coming-soon-more' onclick="expandComingSoon()"><span>Show More</span></button>
  </div>

  {{#if options.hiatus}}
  <div class='hiatus-overlay'>
  <p>{{ options.hiatusMessage }}</p>
  </div>
  {{/if}}
</section>

<div class='lr'>
<section id='section-upcoming'>
  <h2 class='underline'>Upcoming Events</h2>

  <div id='events-list' class='box'>
  {{#each eventsByDate}}
  <article id='upcoming-{{ shortDate }}' class='event event-{{ class }}'>
    <time datetime="{{ date }}"><span class='day'>{{ day }}</span><span class='month'>{{ month }}</span>{{#if special}}<span class='time__special'></span>{{/if}}</time>
    {{#each events}}
    <div class='event-detail event-detail-{{ class }}'>
      {{#if picture}}<img src="images/series/{{picture}}.png">{{/if}}
      {{#if prename}}<p class="series-ident">{{ prename }}</p>{{/if}}
      <h3>{{ name }}</h3>
      <p>
        {{#if link}}<a href='{{ link }}'>{{/if}}
        {{#if time}}{{#if venue}}{{venue}}, {{shortWeekday}} {{time}}{{else}}{{shortWeekday}} {{time}}{{/if}}{{else}}{{#if venue}}{{ venue }}{{/if}}{{/if}}
        {{#if link}}</a>{{/if}}
      </p>
    </div>
    {{/each}}
  </article>
  {{/each}}
  </div>

</section>

<section id='news-feed'>
  <h2 class='underline'>Recommendations</h2>

  <figure class='box' id='recommendation'>
    <figcaption>
      <p class='series-ident'>You might enjoy...</p>

      <h3 id='recommendation__name'></h3>
      <p id='recommendation__genre'></p>

      <hr>

      <p>Or check out one of our favourites.</p>

      <a class='btn btn-recommendations' href='recommendations.html'><span>Recommendations</span></a>
      <p>
        <a href='recommendations.html#genre=action' class='genre genre-action'>Action</a>
        <a href='recommendations.html#genre=romance' class='genre genre-romance'>Romance</a>
        <a href='recommendations.html#genre=slice-of-life' class='genre genre-slice-of-life'>Slice of life</a>
        <a href='recommendations.html#genre=comedy' class='genre genre-comedy'>Comedy</a>
        <a href='recommendations.html#genre=mystery' class='genre genre-mystery'>Mystery</a>
        ...
      </p>
    </figcaption>

    <img class='series-picture' id='recommendation__picture'>
  </figure>

  <h2 class='underline'>News Feed</h2>

  {{#each freshNews}}
  <article class='news box'>
  <time datetime="{{ date }}"><span class='day'>{{ day }}</span><span class='month'>{{ month }}</span></time>
  <h3>{{title}}</h3>
  {{#each body}}
  <p>{{this}}</p>
  {{/each}}
  {{#if discordLink}}
  <p><a class='btn btn-discord' href='https://discord.gg/sypjyaA'><i></i><span>Join the Discord</span></a></p>
  {{/if}}
  </article>
  {{/each}}

  <!-- <div id='news-more-switch'>
    <button class='btn btn-news-more' onclick="showNews()"><span>Show More News</span></button>
  </div> -->

  <div id='news-more'>
    {{#each staleNews}}
    <article class='news box'>
    <time datetime="{{ date }}"><span class='day'>{{ day }}</span><span class='month'>{{ month }}</span></time>
    <h3>{{title}}</h3>
    {{#each body}}
    <p>{{this}}</p>
    {{/each}}
    {{#if discordLink}}
    <p><a class='btn btn-discord' href='https://discord.gg/sypjyaA'><i></i><span>Join the Discord</span></a></p>
    {{/if}}
    </article>
    {{/each}}
  </div>
</section>
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
