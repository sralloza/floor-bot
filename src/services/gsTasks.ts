import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";

interface AssignedTask {
  week: number;
  bathrooms: string;
  livingRoom: string;
  kitchen: string;
}

interface AdvancedSingleTask {
  user: string;
  done: boolean;
}

interface AdvancedAssignedTask {
  week: number;
  bathrooms: AdvancedSingleTask;
  livingRoom: AdvancedSingleTask;
  kitchen: AdvancedSingleTask;
}

interface DBInput {
  semana: number;
  baños: string;
  salón: string;
  cocina: string;
}

@Service()
export default class GSTasksService {
  sheetID = settings.google_sheets_ids.tasks;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  private processSingleTaskCell(
    cell: GoogleSpreadsheetCell
  ): AdvancedSingleTask {
    const style = cell.effectiveFormat.backgroundColor;
    const done = !(style.red === 1 && style.green === 1 && style.blue === 1);
    const user = String(cell.value);
    return { user, done };
  }

  private setGreenBackground(cell: GoogleSpreadsheetCell) {
    cell.backgroundColor = { red: 0, green: 1, blue: 0, alpha: 1 };
  }
  private setWhiteBackground(cell: GoogleSpreadsheetCell) {
    cell.backgroundColor = { red: 1, green: 1, blue: 1, alpha: 1 };
  }

  public async createAssignedTask(assignedTask: AssignedTask) {
    const sheet = this.doc.sheetsById[this.sheetID];
    console.log(sheet);
    const newRow: DBInput = {
      semana: assignedTask.week,
      baños: assignedTask.bathrooms,
      salón: assignedTask.livingRoom,
      cocina: assignedTask.kitchen,
    };
    await sheet.addRow(newRow as any);
  }

  public async getAssignedTasks(): Promise<AdvancedAssignedTask[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const data: AdvancedAssignedTask[] = [];

    for (let i: number = 0; i < rows.length; i++) {
      let row = rows[i];
      await sheet.loadCells(row.a1Range.split("!")[1]);

      const week = sheet.getCell(i + 1, 0);
      const bathrooms = sheet.getCell(i + 1, 1);
      const livingRoom = sheet.getCell(i + 1, 2);
      const kitchen = sheet.getCell(i + 1, 3);
      data.push({
        week: +week.value,
        bathrooms: this.processSingleTaskCell(bathrooms),
        livingRoom: this.processSingleTaskCell(livingRoom),
        kitchen: this.processSingleTaskCell(kitchen),
      });
    }
    return data;
  }

  public async finishTask(user: string): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    const rowIndex = rows.length;
    let row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    const bathrooms = sheet.getCell(rowIndex, 1);
    const livingRoom = sheet.getCell(rowIndex, 2);
    const kitchen = sheet.getCell(rowIndex, 3);

    if (bathrooms.value == user) this.setGreenBackground(bathrooms);
    else if (livingRoom.value == user) this.setGreenBackground(livingRoom);
    else if (kitchen.value == user) this.setGreenBackground(kitchen);
    else throw new Error("Invalid row (user not present)");

    await sheet.saveUpdatedCells();
  }

  public async resetTask(user: string): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    const rowIndex = rows.length;
    let row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    const bathrooms = sheet.getCell(rowIndex, 1);
    const livingRoom = sheet.getCell(rowIndex, 2);
    const kitchen = sheet.getCell(rowIndex, 3);

    if (bathrooms.value == user) this.setWhiteBackground(bathrooms);
    else if (livingRoom.value == user) this.setWhiteBackground(livingRoom);
    else if (kitchen.value == user) this.setWhiteBackground(kitchen);
    else throw new Error("Invalid row (user not present)");

    await sheet.saveUpdatedCells();
  }
}
