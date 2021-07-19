import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

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

@Service()
export default class GSTasksService {
  validTasksSheetID = 27379859;

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

  public async getValidTasks() {
    const sheet = this.doc.sheetsById[this.validTasksSheetID];
    const rows = await sheet.getRows();
    const validTasks = rows.map((e) => e.taskName);
    return validTasks;
  }

  public async createAssignedTask(assignedTask: AssignedTask) {
    const sheet = this.doc.sheetsById[0];
    console.log(sheet);
    await sheet.addRow({
      Semana: assignedTask.week,
      Baños: assignedTask.bathrooms,
      Salón: assignedTask.livingRoom,
      Cocina: assignedTask.kitchen,
    });
  }

  public async getAssignedTasks(): Promise<AdvancedAssignedTask[]> {
    const sheet = this.doc.sheetsById[0];
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
    const sheet = this.doc.sheetsById[0];
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
    const sheet = this.doc.sheetsById[0];
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
