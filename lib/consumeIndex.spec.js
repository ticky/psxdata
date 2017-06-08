const path = require('path');
const { JSDOM } = require('jsdom');
const consumeIndex = require('./consumeIndex');

describe('consumeIndex', () => {
  it('produces expected output under JSDOM', (done) => {
    expect.assertions(1);

    JSDOM.fromFile(
      path.join(__dirname, '__fixtures__', 'ps1.html'),
      { url: 'https://test-psxdata' }
    )
    .then(
      (dom) => {
        expect(consumeIndex(dom.window.document)).toMatchSnapshot();
        done();
      },
      (error) => {
        done();
      }
    );
  });
});
