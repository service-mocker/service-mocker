import { expect } from 'chai';
import { PrefixedConsole } from 'service-mocker/utils';

export default function() {
  describe('PrefixedConsole', () => {
    describe('inheritance', () => {
      it('should inherit from `console` object', () => {
        const c = new PrefixedConsole();

        for (let prop in console) {
          expect(c).to.have.property(prop);
        }
      });
    });

    describe('.color()', () => {
      it('should return a new instance', () => {
        const c = new PrefixedConsole();
        const cc = c.color('#fff');

        expect(cc).to.be.an.instanceof(PrefixedConsole);
        expect(cc).not.to.equal(c);
      });

      it('should be set with new color', () => {
        const c = new PrefixedConsole();

        expect(c.color('#fff')).to.have.property('_color')
          .and.that.equals('#fff');
      });
    });

    describe('.scope()', () => {
      it('should return a new instance', () => {
        const c = new PrefixedConsole();
        const cc = c.scope('test');

        expect(cc).to.be.an.instanceof(PrefixedConsole);
        expect(cc).not.to.equal(c);
      });

      it('should be set with new scope', () => {
        const c = new PrefixedConsole();

        expect(c.scope('test')).to.have.property('_namespace')
          .and.that.contains('test');
      });
    });

    describe('.log()', () => {
      const isIE = /Trident|Edge/.test(navigator.userAgent);

      it('should be logged with scope', () => {
        let logMsg: any;
        const log = console.log.bind(console);
        const c = new PrefixedConsole();

        console.log = (msg, _color, ..._rest) => {
          logMsg = msg;
        };

        c.scope('test').log('whatever');

        console.log = log;

        expect(logMsg).to.contains('test');
      });

      it('should be logged with color', function() {
        if (isIE) {
          return this.skip();
        }

        let logColor: any;
        const log = console.log.bind(console);
        const c = new PrefixedConsole();

        console.log = (_msg, color, _reset, ..._rest) => {
          logColor = color;
        };

        c.color('#fff').log('whatever');

        console.log = log;

        expect(logColor).to.equal('color: #fff');
      });

      it('should reset color for message body', function() {
        if (isIE) {
          return this.skip();
        }

        let logReset: any;
        const log = console.log.bind(console);
        const c = new PrefixedConsole();

        console.log = (_msg, _color, reset, ..._rest) => {
          logReset = reset;
        };

        c.color('#fff').log('whatever');

        console.log = log;

        expect(logReset).to.equal('color: #000');
      });

      it('should not override given styles', function() {
        if (isIE) {
          return this.skip();
        }

        let logMsg: any;
        let logGiven: any;
        const log = console.log.bind(console);
        const c = new PrefixedConsole();

        console.log = (msg, _color, _reset, given, ..._rest) => {
          logMsg = msg;
          logGiven = given;
        };

        c.color('#fff').log('%cwhatever%c', 'font-size: 16px');

        console.log = log;

        expect(logGiven).to.equal('font-size: 16px');
        expect(logMsg.match(/%c/g)).to.have.lengthOf(4);
      });
    });
  });
}
