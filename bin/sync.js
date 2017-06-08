const fs = require('fs-then-native');
const path = require('path');
const { JSDOM } = require('jsdom');
const consumeIndex = require('../src/consumeIndex');

const SOURCES = {
  ps1: {
    'ntsc-j': 'http://psxdatacenter.com/jlist.html',
    'ntsc-uc': 'http://psxdatacenter.com/ulist.html',
    'pal': 'http://psxdatacenter.com/plist.html'
  },
  ps2: {
    'ntsc-j': 'http://psxdatacenter.com/psx2/jlist2.html',
    'ntsc-uc': 'http://psxdatacenter.com/psx2/ulist2.html',
    'pal': 'http://psxdatacenter.com/psx2/plist2.html'
  },
  psp: {
    'ntsc-j': 'http://psxdatacenter.com/psp/jlist.html',
    'ntsc-uc': 'http://psxdatacenter.com/psp/ulist.html',
    'pal': 'http://psxdatacenter.com/psp/plist.html'
  }
};

Promise.all(
  Object.keys(SOURCES).map((platform) => {
    const platformRegions = SOURCES[platform];

    console.log(`processing platform '${platform}'...`);
    return Promise.all(
      Object.keys(platformRegions).map((region) => {
        const url = platformRegions[region];

        console.log(`fetching and parsing '${url}'...`)
        return JSDOM.fromURL(url)
          .then((dom) => {
            try {
              return consumeIndex(dom.window.document);
            } catch (error) {
              console.error(`error processing ${platform}/${region}`, error);
              throw error;
            }
          })
          .then((index) => {
            const outputFile = path.join(__dirname, '..', platform, `${region}.json`);
            console.log(`writing to '${outputFile}'...`);
            return fs.writeFile(outputFile, `${JSON.stringify(index, null, '  ')}\n`);
          });
      })
    );
  })
)
.then(
  (result) => {
    console.log('done!');
  },
  (error) => {
    console.error(error);
  }
);