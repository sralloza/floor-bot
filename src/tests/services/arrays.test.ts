import "reflect-metadata";
import Container from "typedi";
import ArraysService from "../../services/arrays";

describe("arrays", () => {
  let service: ArraysService;
  const array = ["one", "two", "three", "four"];
  beforeAll(() => {
    service = Container.get(ArraysService);
  });
  it("should rotate array", () => {
    const expected = ["two", "three", "four", "one"];
    const other = service.rotate(array, 1);
    expect(other).toStrictEqual(expected);
  });

  it("should not rotate negative numbers", () => {
    expect(() => service.rotate(array, -1)).toThrow("Can't rotate negative times");
  });
});
