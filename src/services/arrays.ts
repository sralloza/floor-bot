import { Service } from "typedi";

@Service()
export default class ArraysService {
  constructor() {}

  public rotate<T>(array: T[], times = 1): T[] {
    if (times < 0) throw new Error("Can't rotate negative times");
    while (times--) {
      const temp = array.shift() as T;
      array.push(temp);
    }
    return array;
  }
}
