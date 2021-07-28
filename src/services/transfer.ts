import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
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
    @Inject() private transactionService: GSTransactionsService
  ) {}

  public async transfer(
    userFrom: string,
    userTo: string,
    week: number,
    taskType: TaskType
  ): Promise<void> {
    // 1. Transfer tickets
    await this.ticketsService.transferTickets(userFrom, userTo, taskType, 1);

    // 2. Transfer task
    await this.tasksService.transferTask(userTo, week, taskType);

    // 3. Register transaction
    const t: Transaction = {
      timestamp: new Date(),
      userFrom,
      userTo,
      task: taskType,
      week: week,
      tickets: 1
    };
    await this.transactionService.createTransaction(t);
  }
}
