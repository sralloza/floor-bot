import "reflect-metadata";
import Container from "typedi";
import GSLogsService from "../../services/gsLogs";
import mockdate from "mockdate";

describe("GSLogsService", () => {
  let service: GSLogsService;
  const addMock = jest.fn();

  beforeAll(() => {
    mockdate.set(new Date());
    const logMock = jest.fn();
    const docMock = jest.fn().mockImplementation(() => {
      return { sheetsById: { "1473685009": { addRow: addMock } } };
    });
    Container.set("logger", logMock());
    Container.set("doc", docMock());
    service = Container.get(GSLogsService);
  });

  afterAll(() => {
    mockdate.reset();
  });

  it("should log messages", async () => {
    await service.logMessage("test");
    expect(addMock.mock.calls.length).toBe(1);
    expect(addMock.mock.calls[0][0]).toStrictEqual([new Date().toJSON(), "test"]);
  });
});
