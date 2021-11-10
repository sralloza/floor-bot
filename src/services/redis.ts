import { Inject, Service } from "typedi";
import { RedisObj } from "../loaders/dependencyInjector";
import { WeeklyStatefulTask } from "./gsTasks";
import { userBalance } from "./gsTickets";
import { Transaction } from "./gsTransactions";
import { RegisteredUser } from "./gsUsers";

const REDIS_KEYS_MAPPER = {
  tasks: "tasks",
  tasksTableURL: "tasksTableURL",
  tickets: "tickets",
  ticketsTableURL: "ticketsTableURL",
  transactions: "transactions",
  users: "users"
};

@Service()
export default class RedisService {
  constructor(@Inject("redis") private client: RedisObj | undefined) {}

  // General
  public async clearCache(): Promise<number> {
    if (!this.client) return 0;
    return await this.client.del(...Object.keys(REDIS_KEYS_MAPPER));
  }

  public async getCacheKeys(pattern = "*"): Promise<string[]> {
    if (!this.client) return [];
    return await this.client.keys(pattern);
  }

  // Tasks
  public async getTasks(): Promise<WeeklyStatefulTask[] | null> {
    if (!this.client) return null;
    const result = await this.client.get(REDIS_KEYS_MAPPER.tasks);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTasks(tasks: WeeklyStatefulTask[]): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.tasks, JSON.stringify(tasks));
    await this.delTasksTableURL();
  }
  public async delTasks(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.tasks);
    await this.delTasksTableURL();
  }

  public async getTasksTableURL(): Promise<string | null> {
    if (!this.client) return null;
    return await this.client.get(REDIS_KEYS_MAPPER.tasksTableURL);
  }
  public async setTasksTableURL(tableURL: string): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.tasksTableURL, tableURL);
  }
  public async delTasksTableURL(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.tasksTableURL);
  }

  // Tickets
  public async getTickets(): Promise<userBalance[] | null> {
    if (!this.client) return null;
    const result = await this.client.get(REDIS_KEYS_MAPPER.tickets);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTickets(tickets: userBalance[]): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.tickets, JSON.stringify(tickets));
    await this.delTicketsTableURL();
  }
  public async delTickets(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.tickets);
    await this.delTicketsTableURL();
  }

  public async getTicketsTableURL(): Promise<string | null> {
    if (!this.client) return null;
    return await this.client.get(REDIS_KEYS_MAPPER.ticketsTableURL);
  }
  public async setTicketsTableURL(tableURL: string): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.ticketsTableURL, tableURL);
  }
  public async delTicketsTableURL(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.ticketsTableURL);
  }

  // Transactions
  public async getTransactions(): Promise<Transaction[] | null> {
    if (!this.client) return null;
    const result = await this.client.get(REDIS_KEYS_MAPPER.transactions);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setTransactions(transactions: Transaction[]): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.transactions, JSON.stringify(transactions));
  }
  public async delTransactions(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.transactions);
  }

  // Users
  public async getUsers(): Promise<RegisteredUser[] | null> {
    if (!this.client) return null;
    const result = await this.client.get(REDIS_KEYS_MAPPER.users);
    if (result) return JSON.parse(result);
    return null;
  }
  public async setUsers(users: RegisteredUser[]): Promise<void> {
    if (!this.client) return;
    await this.client.set(REDIS_KEYS_MAPPER.users, JSON.stringify(users));
  }
  public async delUsers(): Promise<void> {
    if (!this.client) return;
    await this.client.del(REDIS_KEYS_MAPPER.users);
  }
}
