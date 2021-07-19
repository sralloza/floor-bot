import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";

interface exchangeRate {
  concept: string;
  tickets: number;
}

@Service()
export default class GSExchangeRate {
  sheetID = 1120508069;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet
  ) {}

  public async getRates(): Promise<exchangeRate[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const balances: exchangeRate[] = rows.map(({ concepto, tickets }) => {
      return { concept: concepto, tickets: +tickets };
    });
    return balances;
  }
}
