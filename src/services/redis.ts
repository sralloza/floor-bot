import { Inject, Service } from "typedi";
import { RedisObj } from "../loaders/dependencyInjector";
import { WeeklyStatefulTask } from "./gsTasks";
import { userBalance } from "./gsTickets";

const REDIS_KEYS_MAPPER = {
  tasks: "tasks",
  tickets: "tickets",
  ticketsTableURL: "ticketsTableURL"
};

@Service()
export default class RedisService {
  constructor(@Inject("redis") private redis: RedisObj) {}

  // Tasks
  public async getTasks(): Promise<WeeklyStatefulTask[] | null> {
    const result = await this.redis.get(REDIS_KEYS_MAPPER.tasks);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTasks(tasks: WeeklyStatefulTask[]): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.tasks, 5 * 60, JSON.stringify(tasks));
  }

  // Tickets
  public async getTickets(): Promise<userBalance[] | null> {
    const result = await this.redis.get(REDIS_KEYS_MAPPER.tickets);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTickets(tickets: userBalance[]): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.tickets, 5 * 60, JSON.stringify(tickets));
    await this.redis.del(REDIS_KEYS_MAPPER.ticketsTableURL);
  }

  public async getTicketsTableURL(): Promise<string | null> {
    return await this.redis.get(REDIS_KEYS_MAPPER.ticketsTableURL);
  }
  public async setTicketsTableURL(tableURL: string): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.ticketsTableURL, 5 * 60, tableURL);
  }
}
