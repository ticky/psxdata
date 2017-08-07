const fs = require('fs-extra');
const path = require('path');
const Queue = require('queue-that-promise');
const { JSDOM } = require('jsdom');

const consumeIndex = require('../lib/consumeIndex');
const consumeTitlePage = require('../lib/consumeTitlePage');

const ARGUMENTS = process.argv.slice(2);

const cachedRequest = require('cached-request')(require('request'));
cachedRequest.setCacheDirectory(path.join(__dirname, '../.cache'));

const promiseRequest = (url) => (
  new Promise((resolve, reject) => {
    cachedRequest(
      {
        // `encoding: null` makes `body` return a Buffer,
        // which will force JSDOM to sniff encoding, rather
        // than fall back to UTF-8
        encoding: null,
        url,
        ttl: (
          ARGUMENTS.indexOf('--from-cache') === -1
            ? 360000
            : Infinity
        )
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(body);
      }
    );
  })
);

const SOURCES = {
  ps1: {
    'ntsc-j': 'https://psxdatacenter.com/jlist.html',
    'ntsc-uc': 'https://psxdatacenter.com/ulist.html',
    'pal': 'https://psxdatacenter.com/plist.html'
  },
  ps2: {
    'ntsc-j': 'https://psxdatacenter.com/psx2/jlist2.html',
    'ntsc-uc': 'https://psxdatacenter.com/psx2/ulist2.html',
    'pal': 'https://psxdatacenter.com/psx2/plist2.html'
  },
  psp: {
    'ntsc-j': 'https://psxdatacenter.com/psp/jlist.html',
    'ntsc-uc': 'https://psxdatacenter.com/psp/ulist.html',
    'pal': 'https://psxdatacenter.com/psp/plist.html'
  }
};

const JSON_OPTIONS = { spaces: '  ' };

const mainQueue = new Queue();

Object.keys(SOURCES).forEach((platform) => {
  const platformRegions = SOURCES[platform];

  Object.keys(platformRegions).forEach((region) => {
    mainQueue.add(() => {
      const url = platformRegions[region];

      console.log(`processing '${url}'...`)

      return promiseRequest(url)
        .then((body) => {
          try {
            console.debug(body);
            const dom = new JSDOM(body, { url });
            const index = consumeIndex(dom.window.document);
            dom.window.close();
            delete dom;
            return index;
          } catch (error) {
            console.error(`error processing ${platform}/${region}`, error);
            throw error;
          }
        })
        .then((index) => {
          const regionQueue = new Queue();

          index.forEach((entry, entryIndex) => {
            if (entry.link) {
              regionQueue.add(() => {
                console.log(`processing '${entry.link}' (${(entryIndex + 1).toLocaleString()} of ${index.length.toLocaleString()})...`);

                return promiseRequest(entry.link)
                  .then((body) => {
                    try {
                      const dom = new JSDOM(body, { url: entry.link });
                      const data = consumeTitlePage(dom.window.document, entry);
                      dom.window.close();
                      delete dom;
                      return data;
                    } catch (error) {
                      console.error(`error processing ${platform}/${region}/${entry.title}`, error);
                      throw error;
                    }
                  })
                  .then((title) => {
                    const titleId = (title.id instanceof Array) ? title.id.join(',') : title.id;
                    const outputFilePath = path.join(region, `${titleId}.json`);
                    const outputFile = path.join(__dirname, '..', platform, outputFilePath);

                    return fs.outputJson(outputFile, title, JSON_OPTIONS)
                      .then(() => {
                        entry.dataLink = outputFilePath;
                        return entry;
                      });
                  });
              });
            }
          });

          return regionQueue.done()
            .then(() => index);
        })
        .then((index) => {
          const outputFile = path.join(__dirname, '..', platform, `${region}.json`);

          return fs.outputJson(outputFile, index, JSON_OPTIONS)
            .then(() => {
              return index;
            });
        });
    });
  });
});

mainQueue.done()
.then(
  (result) => {
    console.log('done!');
  },
  (error) => {
    console.error(error);
  }
);
