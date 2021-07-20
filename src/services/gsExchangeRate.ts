import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import { TaskType } from "./gsTasks";

interface ExchangeRate {
  concept: string;
  tickets: number;
}

interface DBInput {
  concepto: string;
  tickets: string;
}

@Service()
export default class GSExchangeRateService {
  sheetID = settings.google_sheets_ids.exchangesRates;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getRates(): Promise<ExchangeRate[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: ExchangeRate[] = rows.map((row) => {
      const { concepto: concept, tickets } = row as unknown as DBInput;
      return { concept, tickets: +tickets };
    });
    return balances;
  }

  public async getRateByTaskType(taskType: TaskType): Promise<ExchangeRate> {
    const rates = await this.getRates();

    switch (taskType) {
      case "Kitchen":
        return rates.filter((e) => e.concept == "cocina")[0];
      case "Bathroom":
        return rates.filter((e) => e.concept == "baños")[0];
      case "LivingRoom":
        return rates.filter((e) => e.concept == "salón")[0];
    }
  }
}
