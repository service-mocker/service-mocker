export class Defer {
  done = false;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (value) => {
        resolve(value);
        this.done = true;
      };

      this.reject = (reason) => {
        reject(reason);
        this.done = true;
      };
    });
  }
}
