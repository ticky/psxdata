const ATTRIBUTE_MAPPING = {
  'official title': 'title',
  'developer': 'developer',
  'publisher': 'publisher'
};

module.exports = function consumeTitlePage(document, data = {}) {
  const gameCover = document.querySelector('#table2 > tbody > tr:last-of-type > td > img');
  if (gameCover) {
    data.coverLink = gameCover.src;
  }

  const detail = Object.assign({}, data);

  delete data.discs;

  Array.from(document.querySelectorAll(
    '#table2 > tbody > tr:last-of-type > td tr'
  )).forEach((row) => {
    const attribute = row.children[0].textContent.trim().toLowerCase();
    let property;
    let value = row.children[1].textContent.trim();

    if (attribute === 'common title') {
      if (value !== detail.title) {
        property = 'commonTitle';
      }
    } else if (attribute === 'genre / style') {
      const [ genre, style ] = value.split(/\//).map((string) => string.trim());
      detail.genre = genre;
      detail.style = style;
    } else if (attribute === 'date released') {
      // parse date into ISO 8601 date
      detail.date = new Date(value).toISOString().slice(0, 10);
    } else {
      property = ATTRIBUTE_MAPPING[attribute];
    }

    // Trim period from end of publisher names
    if (['developer', 'publisher'].indexOf(property) !== -1) {
      value = value.replace(/\.$/, '');
    } 

    if (property && value) {
      detail[property] = value;
    }

    if (row.children.length > 2) {
      Array.from(row.querySelectorAll('img[src*=rating]'))
        .forEach((ratingImage) => {
          const ratingText = ratingImage.src.split('/').pop().split('.').shift();
          if (detail.rating) {
            if (detail.rating instanceof Array) {
              detail.rating.push(ratingText);
            } else {
              detail.rating = [detail.rating, ratingText];
            }
          } else {
            detail.rating = ratingText;
          }
        });
    }
  });

  data.title = detail.title;

  return detail;
};
