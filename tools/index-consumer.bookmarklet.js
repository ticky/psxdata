{
  // Missing from this:
  //  * 'ar'
  //  * 'c'
  //  * 'cj'
  //  * 'cr'
  //  * 'fl'
  //  * 'ga'
  //  * 'h'
  //  * 'ir' for 'Iranian' (there doesn't appear to be _one_ 'Iranian' language)
  //  * 'sc'
  const LANGUAGE_MAP = {
    a:  'en-AU',
    af: 'af',
    ca: 'ca',
    ch: 'zh',
    cz: 'cs',
    d:  'da',
    du: 'nl',
    e:  'en',
    f:  'fr',
    fi: 'fi',
    g:  'de',
    gr: 'el',
    hu: 'hu',
    i:  'it',
    is: 'he',
    j:  'jp',
    k:  'kr',
    m:  'es-MX',
    n:  'no',
    nw: 'no',
    p:  'pt',
    pl: 'pl',
    po: 'pl',
    r:  'ru',
    s:  'es',
    sw: 'sv',
    t:  'tr'
  };

  document.location = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(Array.from(document.querySelectorAll('.sectiontable tr'))
    .filter((row) => row.childElementCount)
    .map((row) => {
      const data = {};

      // Parse ID lists, split on newlines
      data.id = row.querySelector('.col2, .col6').innerText.split(/\r?\n/g);

      // Infer disc count from IDs
      const discs = data.id.length;

      // If only one ID, switch to a string
      if (data.id.length === 1) {
        data.id = data.id.shift();
      }

      // Parse out just the title (ignore disc count)
      const titleColumn = row.querySelector('.col3, .col7');

      data.title = titleColumn.firstChild.textContent
        .replace(/\[\s*\d DISCS\s*\]/g, '')
        .replace(/^[\s-]+|[\s-]+$/g, '')

      // Parse out any extra title info, such as disc titles
      const extras = Array.from(row.querySelectorAll('.col3 > span, .col7 > span'));

      if (extras.length) {
        data.extras = extras.map((span) => span.innerText.trim());

        // If only one extra, switch to a string
        if (data.extras.length === 1) {
          data.extras = data.extras.shift();
        }
      }

      data.discs = discs;

      // Parse language list
      const languages = row.querySelector('.col4, .col8').textContent.match(/\w+/g);
      if (languages) {
        data.languages = languages
          .map((language) => LANGUAGE_MAP[language.toLowerCase()] || language);
      }

      // Parse PSXDataCenter detail link
      const link = row.querySelector('.col1 a[href], .col5 a[href]');
      if (link) {
        data.link = link.href;
      }

      return data;
    }), null, '  '))));
}
