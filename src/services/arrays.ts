import { Service } from "typedi";

@Service()
export default class ArraysService {
  constructor() {}

  public rotate<T>(array: T[], times = 1): T[] {
    if (times < 0) times = array.length + times;
    while (times--) {
      const temp = array.shift() as T;
      array.push(temp);
    }
    return array;
  }
}
