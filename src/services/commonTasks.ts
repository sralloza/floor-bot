import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import GSExchangeRateService from "./gsExchangeRate";
import GSTicketsService from "./gsTickets";
import GSTransactionsService, { Transaction } from "./gsTransactions";
import GSUsersService from "./gsUsers";

@Service()
export default class CommonTasksService {
  sheetID = settings.google_sheets_ids.logs;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject() private userService: GSUsersService,
    @Inject() private ticketsService: GSTicketsService,
    @Inject() private exchangeRateService: GSExchangeRateService,
    @Inject() private transactionsService: GSTransactionsService
  ) {}

  public async trash(telegramID: number) {
    const user = await this.userService.getUserByIdOrError(telegramID);
    const rate = await this.exchangeRateService.getRateByConcept("basura");
    await this.ticketsService.transferTickets(
      "System",
      user.username,
      rate.tickets
    );
    const t: Transaction = {
      timestamp: new Date(),
      task: "Basura",
      tickets: rate.tickets,
      userFrom: "System",
      userTo: user.username,
      week: 0,
    };
    await this.transactionsService.createTransaction(t);
  }
}
