import { Inject, Service } from "typedi";
import { RedisObj } from "../loaders/dependencyInjector";
import { WeeklyStatefulTask } from "./gsTasks";
import { userBalance } from "./gsTickets";
import { Transaction } from "./gsTransactions";
import { RegisteredUser } from "./gsUsers";

const REDIS_KEYS_MAPPER = {
  tasks: "tasks",
  tickets: "tickets",
  ticketsTableURL: "ticketsTableURL",
  transactions: "transactions",
  users: "users"
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
  public async delTasks(): Promise<void> {
    await this.redis.del(REDIS_KEYS_MAPPER.tasks);
  }

  // Tickets
  public async getTickets(): Promise<userBalance[] | null> {
    const result = await this.redis.get(REDIS_KEYS_MAPPER.tickets);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTickets(tickets: userBalance[]): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.tickets, 5 * 60, JSON.stringify(tickets));
    await this.delTicketsTableURL();
  }
  public async delTickets(): Promise<void> {
    await this.redis.del(REDIS_KEYS_MAPPER.tickets);
  }

  public async getTicketsTableURL(): Promise<string | null> {
    return await this.redis.get(REDIS_KEYS_MAPPER.ticketsTableURL);
  }
  public async setTicketsTableURL(tableURL: string): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.ticketsTableURL, 5 * 60, tableURL);
  }
  public async delTicketsTableURL(): Promise<void> {
    await this.redis.del(REDIS_KEYS_MAPPER.ticketsTableURL);
  }

  // Transactions
  public async getTransactions(): Promise<Transaction[] | null> {
    const result = await this.redis.get(REDIS_KEYS_MAPPER.transactions);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTransactions(transactions: Transaction[]): Promise<void> {
    await this.redis.setex(
      REDIS_KEYS_MAPPER.transactions,
      5 * 60,
      JSON.stringify(transactions)
    );
  }
  public async delTransactions(): Promise<void> {
    await this.redis.del(REDIS_KEYS_MAPPER.transactions);
  }

  // Users
  public async getUsers(): Promise<RegisteredUser[] | null> {
    const result = await this.redis.get(REDIS_KEYS_MAPPER.users);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setUsers(users: RegisteredUser[]): Promise<void> {
    await this.redis.setex(REDIS_KEYS_MAPPER.users, 5 * 60, JSON.stringify(users));
  }
  public async delUsers(): Promise<void> {
    await this.redis.del(REDIS_KEYS_MAPPER.users);
  }
}
