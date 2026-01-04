

function template_series(series, opts = {}) {
  opts = {
    large: false,
    isNew: false,
    isNewMonth: false,
    showDate: false,
    showRating: false,
    showTrailer: false,
    prefix: false,
    showGenres: false,
    info: false,
    ...opts
  }

  if (series === null || !series.hasOwnProperty("name") || series.name === null || series.name == "") {
    return "";
  }

  let cls = (series.movie ? " movie" : "")+((opts.showDate || opts.showRating || opts.showGenres) ? " series--small-title" : "")+(opts.large ? " series--large" : "");
  let prefix = opts.prefix ? opts.prefix : (series.movie ? "Movie" : (opts.isNew ? "New series" : false));

  let divider = '';
  if (opts.isNewMonth) {
    divider = `<div class='divider'><span>${series.longMonth}</span></div>`;
  }

  return `${divider}<figure class="series--right ${cls}">
    	<figcaption>
        ${prefix ? `<p class="series-ident">${prefix}</p>` : ''}
        <h3>${series.name}</h3>
        ${(opts.showGenres && series.genre) ?
          series.genre.map((genre) => {
            let slug = slugify(genre);
            return `<span class="genre genre-${slug}" data-genre="${slug}">${genre}</span>`;
          }).join(' ')
          : ''}

        ${opts.showDate ? `
          ${(opts.isNew && !series.movie) ? "<div class='series-info'><p class='starting'>Starting</p></div>" : ""}
          ${template_date(series)}
        ` : ''}

        ${opts.info ? `<p class='info-line'>${opts.info}</p>` : ''}

        ${(series.trailer && opts.showTrailer) ? `<a class='trailer' href='${trailer}' target='_blank'>Trailer</a>` : ''}

        ${(series.move && series.time) ? `<div class='movie-time'>
          <p class='movie-weekday'>${item.weekday}</p>
          <p class='movie-start-time'>${item.time}</p>
        </div>` : ''}

        ${(opts.showRating && series.rating) ? `<div class='rating'>
          <img class='rating-img rating-${series.rating}' src='images/rating/${(""+series.rating).toLowerCase()}.svg'>
          <div class='rating-hover rating-hover-${series.rating}'>
            <span>Age rating: ${ratingText[series.rating]}</span>
            <div class='rating__tag'></div>
          </div>
        </div>` : ''}

      </figcaption>
      <img class='series-picture' src='images/series/${series.picture}.png'>
    </figure>`;
}

function template_event(event) {

}

function template_date(item, opts = {}) {
  opts = {
    showYear: true,
    ...opts
  };
  return `<time datetime="${item.date}">
      <span class='day'>${item.day}</span>
      <span class='month'>${item.month}</span>
      ${opts.showYear ? `<span class='year'>${item.year}</span>` : ""}
    </time>`;
}
