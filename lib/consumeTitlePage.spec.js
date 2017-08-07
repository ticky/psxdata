const path = require('path');
const { JSDOM } = require('jsdom');
const consumeTitlePage = require('./consumeTitlePage');

describe('consumeTitlePage', () => {
  describe('produces expected output under JSDOM', () => {
    it('for TEKKEN 3', (done) => {
      expect.assertions(1);

      JSDOM.fromFile(
        path.join(__dirname, '__fixtures__', 'SLPS-01300.html'),
        { url: 'https://test-psxdata' }
      )
      .then(
        (dom) => {
          expect(consumeTitlePage(dom.window.document)).toMatchSnapshot();
          done();
        },
        (error) => {
          done();
        }
      );
    });

    it('for LEMMINGS', (done) => {
      expect.assertions(1);

      JSDOM.fromFile(
        path.join(__dirname, '__fixtures__', 'SCES-00009.html'),
        { url: 'https://test-psxdata' }
      )
      .then(
        (dom) => {
          expect(consumeTitlePage(dom.window.document)).toMatchSnapshot();
          done();
        },
        (error) => {
          done();
        }
      );
    });
  });
});
