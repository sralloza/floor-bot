// https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
export class AlreadyCompletedTaskError extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AlreadyCompletedTaskError.prototype);
  }
}
