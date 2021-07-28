import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import { TaskType } from "./gsTasks";

interface userBalance {
  user: string;
  kitchen: number;
  livingRoom: number;
  bathrooms: number;
}

interface DBInput {
  usuario: string;
  cocina: string;
  salón: string;
  baños: string;
}

type _Mapper = { [key in TaskType]: number };

const TASK_TYPE_TO_COLUMN: _Mapper = {
  Kitchen: 1,
  Bathroom: 2,
  LivingRoom: 3
};

@Service()
export default class GSTicketsService {
  sheetID = settings.google_sheets_ids.tickets;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getTickets(): Promise<userBalance[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: userBalance[] = rows.map((row) => {
      const { usuario: user, cocina, salón, baños } = row as unknown as DBInput;
      return { user, kitchen: +cocina, livingRoom: +salón, bathrooms: +baños };
    });
    return balances;
  }

  public async transferTickets(
    from: string,
    to: string,
    task: TaskType,
    tickets: number
  ): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();

    let validFrom = false;
    let validTo = false;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await sheet.loadCells(row.a1Range.split("!")[1]);
      const user = sheet.getCell(i + 1, 0);
      if (user.value == from) {
        validFrom = true;
        const balanceCell = sheet.getCell(i + 1, TASK_TYPE_TO_COLUMN[task]);
        balanceCell.value = +balanceCell.value - tickets;
      } else if (user.value == to) {
        validTo = true;
        const balanceCell = sheet.getCell(i + 1, TASK_TYPE_TO_COLUMN[task]);
        balanceCell.value = +balanceCell.value + tickets;
      }
    }
    if (!validFrom) throw new Error("From invalid");
    if (!validTo) throw new Error("To invalid");

    await sheet.saveUpdatedCells();
  }
}
