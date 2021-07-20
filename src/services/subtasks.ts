import { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import GSExchangeRateService from "./gsExchangeRate";
import GSTicketsService from "./gsTickets";
import GSTransactionsService, { Transaction } from "./gsTransactions";
import GSUsersService from "./gsUsers";

export type Subtask = "basura" | "lavavajillas";
const VALID_SUBTASKS = ["basura", "lavavajillas"];

@Service()
export default class SubTasksService {
  sheetID = settings.google_sheets_ids.logs;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject() private userService: GSUsersService,
    @Inject() private ticketsService: GSTicketsService,
    @Inject() private exchangeRateService: GSExchangeRateService,
    @Inject() private transactionsService: GSTransactionsService
  ) {}

  public listSubtasks(): string[] {
    return VALID_SUBTASKS;
  }

  public async processSubtask(subtask: Subtask, telegramID: number): Promise<void> {
    const user = await this.userService.getUserByIdOrError(telegramID);
    const rate = await this.exchangeRateService.getRateByConcept(subtask);

    await this.ticketsService.transferTickets("System", user.username, rate.tickets);

    const t: Transaction = {
      timestamp: new Date(),
      task: subtask,
      tickets: rate.tickets,
      userFrom: "System",
      userTo: user.username,
      week: 0
    };
    await this.transactionsService.createTransaction(t);
  }
}
