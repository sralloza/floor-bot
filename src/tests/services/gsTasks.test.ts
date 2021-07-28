import "reflect-metadata";
import Container from "typedi";
import GSTasksService, { WeeklyTask } from "../../services/gsTasks";

describe("GSTasksService", () => {
  let service: GSTasksService;
  const addMock = jest.fn();
  const infoMock = jest.fn();
  const logMock = jest.fn().mockImplementation(() => {
    return { info: infoMock };
  });

  beforeAll(() => {
    Container.set("logger", logMock());
    const docMock = jest.fn().mockImplementation(() => {
      return { sheetsById: { "0": { addRow: addMock } } };
    });
    Container.set("doc", docMock());
    service = Container.get(GSTasksService);
  });

  describe("createWeeklyTask", () => {
    it("should create a weekly task", async () => {
      const task: WeeklyTask = {
        week: 1,
        bathrooms: "user-a",
        livingRoom: "user-b",
        kitchen: "user-c"
      };
      await service.createWeeklyTask(task);
      expect(addMock.mock.calls.length).toBe(1);
      expect(addMock.mock.calls[0][0]).toStrictEqual({
        semana: 1,
        baños: "user-a",
        salón: "user-b",
        cocina: "user-c"
      });
    });
  });
});
