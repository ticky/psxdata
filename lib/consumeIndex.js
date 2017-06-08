const LANGUAGE_MAP = require('./languages');

function findTextNodes(nodeList) {
  return Array.from(nodeList)
    .filter((node) => node.nodeType === 3);
}

module.exports = function consumeIndex(document) {
  return Array.from(document.querySelectorAll('.sectiontable tr'))
    .filter((row) => row.childElementCount)
    .map((row) => {
      const data = {};

      // Get IDs from list
      data.id = findTextNodes(row.querySelector('.col2, .col6').childNodes)
        .map((node) => node.textContent.trim())
        .filter((text) => text);

      // Infer disc count from IDs
      const discs = data.id.length;

      // If only one ID, switch to a string
      if (data.id.length === 1) {
        data.id = data.id.shift();
      }

      // Parse out just the title (ignore disc count)
      const titleColumn = row.querySelector('.col3, .col7');

      data.title = titleColumn.firstChild.textContent
        .replace(/\[\s*\d DISCS\s*\]\]?/g, '')
        .replace(/^[\s-]+|[\s-]+$/g, '')

      // Parse out any extra title info, such as disc titles
      const extraHeadings = Array.from(row.querySelectorAll('.col3 > span > u, .col7 > span > u'));

      if (extraHeadings.length) {
        extraHeadings
          .forEach((heading) => {
            const headingTitle = heading.textContent.toLowerCase().replace(/^\s*|[\:\s]*$/g, '');

            const headingDetailEntries = findTextNodes(heading.nextElementSibling.childNodes)
              .map((text) => (
                text.textContent
                  .replace(/[\s\n]+/g, ' ')
                  .trim()
              ));

            if (headingDetailEntries.length === 1) {
              data[headingTitle] = headingDetailEntries.shift();
            } else if (headingDetailEntries.length > 1) {
              data[headingTitle] = headingDetailEntries;
            }
          });
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
    });
};
