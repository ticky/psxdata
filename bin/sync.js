const fs = require('fs-then-native');
const path = require('path');
const Queue = require('queue-that-promise');
const { JSDOM } = require('jsdom');

const consumeIndex = require('../lib/consumeIndex');
const consumeTitlePage = require('../lib/consumeTitlePage');

const SOURCES = {
  ps1: {
    'ntsc-j': 'http://psxdatacenter.com/jlist.html',
    // 'ntsc-uc': 'http://psxdatacenter.com/ulist.html',
    // 'pal': 'http://psxdatacenter.com/plist.html'
  },
  ps2: {
  //   'ntsc-j': 'http://psxdatacenter.com/psx2/jlist2.html',
    'ntsc-uc': 'http://psxdatacenter.com/psx2/ulist2.html',
  //   'pal': 'http://psxdatacenter.com/psx2/plist2.html'
  },
  psp: {
  //   'ntsc-j': 'http://psxdatacenter.com/psp/jlist.html',
  //   'ntsc-uc': 'http://psxdatacenter.com/psp/ulist.html',
    'pal': 'http://psxdatacenter.com/psp/plist.html'
  }
};

const mainQueue = new Queue();

Object.keys(SOURCES).forEach((platform) => {
  const platformRegions = SOURCES[platform];

  Object.keys(platformRegions).forEach((region) => {
    mainQueue.add(() => {
      const url = platformRegions[region];

      console.log(`processing '${url}'...`)

      return JSDOM.fromURL(url)
        .then((dom) => {
          try {
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
                console.log(`processing '${entry.link}' (#${entryIndex})...`)
                return JSDOM.fromURL(entry.link)
                  .then((dom) => {
                    try {
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

                    return fs.writeFile(outputFile, `${JSON.stringify(title, null, '  ')}\n`)
                      .then(() => {
                        entry.dataLink = outputFilePath;
                        return entry;
                      });
                  })
              });
            }
          });

          return regionQueue.done()
            .then(() => index);
        })
        .then((index) => {
          const outputFile = path.join(__dirname, '..', platform, `${region}.json`);

          return fs.writeFile(outputFile, `${JSON.stringify(index, null, '  ')}\n`)
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