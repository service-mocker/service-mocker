export class Defer {
  /**
   * Indicates whether this defer is end
   *
   * @type {boolean}
   */
  done = false;

  /**
   * Defer's promise object
   *
   * @readonly
   * @type {Promise<any>}
   */
  promise = null;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (result) => {
        resolve(result);
        this.done = true;
      };

      this.reject = (reason) => {
        reject(reason);
        this.done = true;
      };
    });
  }
}
