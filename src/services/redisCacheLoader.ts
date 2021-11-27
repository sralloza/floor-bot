import { Inject, Service } from "typedi";
import { Logger } from "winston";
import GSTasksService from "./gsTasks";
import GSTicketsService from "./gsTickets";
import GSUsersService from "./gsUsers";

@Service()
export default class RedisCacheLoaderService {
  constructor(
    @Inject("logger") private logger: Logger,
    @Inject() private tasksService: GSTasksService,
    @Inject() private ticketsService: GSTicketsService,
    @Inject() private usersService: GSUsersService
  ) {}

  public async loadCache(): Promise<void> {
    await this.tasksService.getTasksAsTable();
    await this.tasksService.getWeeklyTasks();
    await this.ticketsService.getTicketsAsTable();
    await this.ticketsService.getTickets();
    await this.usersService.getUsers();
    this.logger.info("Cache generated");
  }
}
