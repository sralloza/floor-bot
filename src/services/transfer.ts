import { GoogleSpreadsheet } from "google-spreadsheet";
import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import GSExchangeRateService from "./gsExchangeRate";
import GSTasksService, { TaskType } from "./gsTasks";
import GSTicketsService from "./gsTickets";
import GSTransactionsService, { Transaction } from "./gsTransactions";

@Service()
export default class TransferService {
  sheetID = settings.google_sheets_ids.logs;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject() private tasksService: GSTasksService,
    @Inject() private ticketsService: GSTicketsService,
    @Inject() private exchangeRatesService: GSExchangeRateService,
    @Inject() private transactionService: GSTransactionsService
  ) {}

  public async transfer(
    userFrom: string,
    userTo: string,
    week: number,
    taskType: TaskType
  ) {
    // 1. Get exchange rate of task
    const exchangeRate = await this.exchangeRatesService.getRateByTaskType(
      taskType
    );

    // 2. Transfer tickets
    await this.ticketsService.transferTickets(
      userFrom,
      userTo,
      exchangeRate.tickets
    );

    // 3. Transfer task
    await this.tasksService.transfer(userTo, week, taskType);

    // 4. Register transaction
    const t: Transaction = {
      timestamp: new Date(),
      userFrom,
      userTo,
      task: taskType,
      tickets: exchangeRate.tickets,
    };
    await this.transactionService.createTransaction(t);
  }
}
