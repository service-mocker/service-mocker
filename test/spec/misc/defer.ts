import { expect } from 'chai';
import { Defer } from 'service-mocker/lib/utils';

export function deferRunner() {
  describe('Defer', () => {
    describe('.done', () => {
      it('should have a `.done` property', () => {
        expect(new Defer()).to.have.property('done')
          .and.that.is.false;
      });

      it('should be set to `true` when it\'s resolved', () => {
        const deferred = new Defer();

        deferred.resolve();

        expect(deferred.done).to.be.true;
      });

      it('should be set to `true` when it\'s rejected', () => {
        const deferred = new Defer();

        deferred.promise.catch(() => null);

        deferred.reject(null);

        expect(deferred.done).to.be.true;
      });
    });

    describe('.promise', () => {
      it('should have a `.promise` property', () => {
        expect(new Defer()).to.have.property('promise')
          .and.that.is.an.instanceof(Promise);
      });
    });

    describe('.resolve()', () => {
      it('should be resolved', async () => {
        const deferred = new Defer();
        deferred.resolve(1);
        expect(await deferred.promise).to.equal(1);
      });

      it('should be resolved only once', async () => {
        const deferred = new Defer();
        deferred.resolve(1);
        deferred.resolve(2);
        expect(await deferred.promise).to.equal(1);
      });

      it('should not be rejected', async () => {
        const deferred = new Defer();
        deferred.resolve(1);
        deferred.reject(2);
        expect(await deferred.promise).to.equal(1);
      });
    });

    describe('.reject()', () => {
      it('should be rejected', async () => {
        let err: any;
        const deferred = new Defer();

        const promise = deferred.promise.catch(e => {
          err = e;
        });

        deferred.reject(1);

        await promise;

        expect(err).to.equal(1);
      });

      it('should be rejected only once', async () => {
        let err: any;
        const deferred = new Defer();

        const promise = deferred.promise.catch(e => {
          err = e;
        });

        deferred.reject(1);
        deferred.reject(2);

        await promise;

        expect(err).to.equal(1);
      });

      it('should not be resolved', async () => {
        let err: any;
        const deferred = new Defer();

        const promise = deferred.promise.catch(e => {
          err = e;
        });

        deferred.reject(1);
        deferred.resolve(2);

        await promise;

        expect(err).to.equal(1);
      });
    });
  });
}
