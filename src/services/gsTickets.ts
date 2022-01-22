import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import { TaskType } from "./gsTasks";
import Latex2PNGService from "./latex2png";
import RedisService from "./redis";

export interface userBalance {
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
  sheetID = settings.googleSheetsIDs.tickets;

  constructor(
    @Inject("doc") private doc: GoogleSpreadsheet,
    @Inject("logger") private logger: Logger,
    @Inject() private latex2pngService: Latex2PNGService,
    @Inject() private redisService: RedisService
  ) {}

  public async getTickets(): Promise<userBalance[]> {
    const redisMemory = await this.redisService.getTickets();
    if (redisMemory) return redisMemory;

    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: userBalance[] = rows.map((row) => {
      const { usuario: user, cocina, salón, baños } = row as unknown as DBInput;
      return { user, kitchen: +cocina, livingRoom: +salón, bathrooms: +baños };
    });

    await this.redisService.setTickets(balances);
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
    await this.redisService.delTickets();

    if (settings.awaitTableGeneration) await this.getTicketsAsTable();
    else this.getTicketsAsTable();
  }

  public async getTicketsAsTable(): Promise<string> {
    const redisMemory = await this.redisService.getTicketsTableURL();
    if (redisMemory) return redisMemory;

    const tickets = await this.getTickets();
    const translatedTickets: FormattedDBInput[] = tickets.map((ticket) => {
      return {
        usuario: ticket.user,
        cocina: ticket.kitchen,
        baños: ticket.bathrooms,
        salón: ticket.livingRoom
      };
    });

    const newURL = await this.latex2pngService.genTableImageUrl(translatedTickets);
    if (newURL == "error") {
      this.logger.info("Error generating tickets table URL");
      return "error";
    }
    
    this.logger.info("Generated tickets table URL: " + newURL);
    await this.redisService.setTicketsTableURL(newURL);
    return newURL;
  }
}
