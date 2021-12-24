import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import RedisService from "./redis";

export interface Transaction {
  timestamp: Date;
  userFrom: string;
  userTo: string;
  task: string;
  week: number;
}

interface DBInput {
  marcaTemporal: string;
  usuarioOrigen: string;
  usuarioDestino: string;
  tarea: string;
  semana: string;
}

@Service()
export default class GSTransactionsService {
  sheetID = settings.googleSheetsIDs.transactions;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet,
    @Inject() private redisService: RedisService
  ) {}

  public async getTransactions(): Promise<Transaction[]> {
    const redisMemory = await this.redisService.getTransactions();
    if (redisMemory) return redisMemory;

    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const transactions: Transaction[] = rows.map((row) => {
      const {
        marcaTemporal,
        usuarioOrigen: userFrom,
        usuarioDestino: userTo,
        tarea: task,
        semana: week
      } = row as unknown as DBInput;
      const timestamp = new Date(Date.parse(marcaTemporal));
      return {
        timestamp,
        userFrom,
        userTo,
        task,
        week: +week
      };
    });

    await this.redisService.setTransactions(transactions);
    return transactions;
  }

  public async createTransaction(t: Transaction): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const newRow: DBInput = {
      marcaTemporal: t.timestamp.toJSON(),
      usuarioOrigen: t.userFrom,
      usuarioDestino: t.userTo,
      tarea: t.task,
      semana: t.week.toString()
    };
    await sheet.addRow(newRow as any);
    await this.redisService.delTransactions();
  }
}
