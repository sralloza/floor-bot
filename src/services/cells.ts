import { GoogleSpreadsheetCell } from "google-spreadsheet";
import { Service } from "typedi";
import { StatefulTask } from "./gsTasks";

@Service()
export default class CellsService {
  constructor() {}

  public processTaskCell(cell: GoogleSpreadsheetCell): StatefulTask {
    const style = cell.effectiveFormat.backgroundColor;
    const { red, green, blue } = style;
    const done = red === 0 && green === 1 && blue === 0;
    if (!done)
      if (red !== 0 || green !== 0 || blue !== 0)
        throw new Error("Cell's background is neither green nor white");

    return { user: cell.value.toString(), done };
  }

  public setGreenBackground(cell: GoogleSpreadsheetCell) {
    cell.backgroundColor = { red: 0, green: 1, blue: 0, alpha: 1 };
  }

  public getTaskCellBackgroud(cell: GoogleSpreadsheetCell): "White" | "Green" {
    const { done } = this.processTaskCell(cell);
    return done ? "Green" : "White";
  }
}
