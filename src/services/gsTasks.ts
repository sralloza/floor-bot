import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

interface AssignedTask {
  week: number;
  bathrooms: string;
  livingRoom: string;
  kitchen: string;
}

@Service()
export default class GSTasksService {
  validTasksSheetID = 27379859;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getValidTasks() {
    const sheet = this.doc.sheetsById[this.validTasksSheetID];
    const rows = await sheet.getRows();
    const validTasks = rows.map((e) => e.taskName);
    return validTasks;
  }

  public async createAssignedTask(assignedTask: AssignedTask) {
    const sheet = this.doc.sheetsById[0]
    console.log(sheet)
    await sheet.addRow({
      Semana: assignedTask.week,
      Baños: assignedTask.bathrooms,
      Salón: assignedTask.livingRoom,
      Cocina: assignedTask.kitchen,
    });
  }
}
