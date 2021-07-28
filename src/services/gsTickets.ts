import axios from "axios";
import { GoogleSpreadsheet } from "google-spreadsheet";
import tableToLatex from "make-latex";
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

interface FormattedDBInput {
  usuario: string;
  cocina: number;
  salón: number;
  baños: number;
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

  public async getTicketsAsTable(): Promise<string> {
    const tickets = await this.getTickets();
    const translatedTickets: FormattedDBInput[] = tickets.map((ticket) => {
      return {
        usuario: ticket.user,
        cocina: ticket.kitchen,
        baños: ticket.bathrooms,
        salón: ticket.livingRoom
      };
    });
    const latexTable = tableToLatex(translatedTickets);
    const regex = /\\begin{tabular}{c+}\s([{}\s&\\\-\wñáéíóú]+)\\end{tabular}/;
    const match = regex.exec(latexTable);
    if (!match) throw new Error(latexTable);

    let filteredTable = `
    \\begin{tabular}{cccc}
    \\hline
    ${match[1]}
    \\hline
    \\end{tabular}
    `;
    filteredTable = filteredTable
      .replace("á", "\\'{a}")
      .replace("é", "\\'{e}")
      .replace("í", "\\'{i}")
      .replace("ó", "\\'{o}")
      .replace("ú", "\\'{u}")
      .replace("ñ", "\\~{n}");

    const response = await axios.post(
      "http://latex2png.com/api/convert",
      {
        auth: { user: "guest", password: "guest" },
        latex: filteredTable,
        resolution: 600,
        color: "000000"
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    if (response.data.url === undefined) {
      throw new Error("Invalid image generation");
    }
    return "http://latex2png.com" + response.data.url;
  }
}
