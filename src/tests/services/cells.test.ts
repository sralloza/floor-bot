import { GoogleSpreadsheetCell } from "google-spreadsheet";
import "reflect-metadata";
import Container from "typedi";
import CellsService from "../../services/cells";

describe("CellsService", () => {
  let service: CellsService;

  beforeAll(() => {
    service = Container.get(CellsService);
  });

  const createCellMock = (
    red: number,
    green: number,
    blue: number,
    user = "user",
    alpha = 0.5
  ) => {
    return jest.fn().mockImplementation(() => {
      return {
        effectiveFormat: {
          backgroundColor: {
            red: red,
            green: green,
            blue: blue,
            alpha: alpha
          }
        },
        value: user
      };
    })() as unknown as GoogleSpreadsheetCell;
  };

  describe("processTaskCell", () => {
    it("Should process a green cell", () => {
      const cell = createCellMock(0, 1, 0, "user");
      expect(service.processTaskCell(cell)).toStrictEqual({ done: true, user: "user" });
    });

    it("Should process a white cell", () => {
      const cell = createCellMock(0, 0, 0, "user");
      expect(service.processTaskCell(cell)).toStrictEqual({
        done: false,
        user: "user"
      });
    });

    it("Should throw error if cell is neither green nor white", () => {
      const cell = createCellMock(1, 0, 1, "user");
      expect(() => service.processTaskCell(cell)).toThrow(
        "Cell's background is neither green nor white"
      );
    });
  });

  describe("setGreenBackground", () => {
    it("should set green background", () => {
      const cell = createCellMock(0, 0, 0, "user");
      service.setGreenBackground(cell);
      expect(cell.backgroundColor.alpha).toBe(1);
      expect(cell.backgroundColor.red).toBe(0);
      expect(cell.backgroundColor.green).toBe(1);
      expect(cell.backgroundColor.blue).toBe(0);
    });
  });

  describe("getTaskCellBackgroud", () => {
    it("Should process a green cell", () => {
      const cell = createCellMock(0, 1, 0, "user");
      expect(service.getTaskCellBackgroud(cell)).toBe("Green");
    });

    it("Should process a white cell", () => {
      const cell = createCellMock(0, 0, 0, "user");
      expect(service.getTaskCellBackgroud(cell)).toBe("White");
    });

    it("Should throw error if cell is neither green nor white", () => {
      const cell = createCellMock(1, 0, 1, "user");
      expect(() => service.getTaskCellBackgroud(cell)).toThrow(
        "Cell's background is neither green nor white"
      );
    });
  });
});
