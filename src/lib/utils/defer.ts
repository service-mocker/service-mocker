export class Defer {
  public done: boolean;
  public promise: Promise<any>;

  public resolve: (result?: any) => void;
  public reject: (reason: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = result => {
        resolve(result);
        this.done = true;
      };

      this.reject = reason => {
        reject(reason);
        this.done = true;
      };
    });
  }
}
