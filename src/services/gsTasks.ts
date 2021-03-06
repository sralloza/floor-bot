import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";
import { Telegraf } from "telegraf";
import Container, { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import { AlreadyCompletedTaskError } from "../exceptions";
import ArraysService from "./arrays";
import CellsService from "./cells";
import GSUsersService from "./gsUsers";
import Latex2PNGService from "./latex2png";
import RedisService from "./redis";

export interface WeeklyTask {
  week: number;
  bathrooms: string;
  livingRoom: string;
  kitchen: string;
}

export interface StatefulTask {
  user: string;
  done: boolean;
}

export interface WeeklyStatefulTask {
  week: number;
  bathrooms: StatefulTask;
  livingRoom: StatefulTask;
  kitchen: StatefulTask;
}

export type TaskType = "Bathroom" | "LivingRoom" | "Kitchen";

export interface UserTask {
  week: number;
  taskName: string;
  taskType: TaskType;
}

export interface DBIO {
  semana: number;
  baños: string;
  salón: string;
  cocina: string;
}

@Service()
export default class GSTasksService {
  sheetID = settings.googleSheetsIDs.tasks;

  constructor(
    @Inject("doc") private doc: GoogleSpreadsheet,
    @Inject("logger") private logger: Logger,
    @Inject() private arraysService: ArraysService,
    @Inject() private cellsService: CellsService,
    @Inject() private latex2pngService: Latex2PNGService,
    @Inject() private redisService: RedisService,
    @Inject() private usersService: GSUsersService
  ) {}

  public async createWeeklyTask(task: WeeklyTask): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const newRow: DBIO = {
      semana: task.week,
      baños: task.bathrooms,
      salón: task.livingRoom,
      cocina: task.kitchen
    };

    await sheet.addRow(newRow as any);
    this.logger.info(`Created task: ${JSON.stringify(newRow)}`);
    await this.redisService.delTasks();

    if (settings.awaitTableGeneration) await this.getTasksAsTable();
    else this.getTasksAsTable();
  }

  public async getWeeklyTasks(): Promise<WeeklyStatefulTask[]> {
    const redisMemory = await this.redisService.getTasks();
    if (redisMemory) return redisMemory;

    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const data: WeeklyStatefulTask[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await sheet.loadCells(row.a1Range.split("!")[1]);

      const week = sheet.getCell(i + 1, 0);
      const bathrooms = sheet.getCell(i + 1, 1);
      const livingRoom = sheet.getCell(i + 1, 2);
      const kitchen = sheet.getCell(i + 1, 3);
      data.push({
        week: +week.value,
        bathrooms: this.cellsService.processTaskCell(bathrooms),
        livingRoom: this.cellsService.processTaskCell(livingRoom),
        kitchen: this.cellsService.processTaskCell(kitchen)
      });
    }

    await this.redisService.setTasks(data);
    return data;
  }

  public async getUserRemainingTasks(username: string): Promise<UserTask[]> {
    const tasks = await this.getWeeklyTasks();
    const filteredTasks: UserTask[] = [];

    for (const task of tasks) {
      if (task.bathrooms.user === username && !task.bathrooms.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Baños",
          taskType: "Bathroom"
        });
      if (task.livingRoom.user === username && !task.livingRoom.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Salón",
          taskType: "LivingRoom"
        });
      if (task.kitchen.user === username && !task.kitchen.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Cocina",
          taskType: "Kitchen"
        });
    }

    return filteredTasks;
  }

  public async completeTask(
    username: string,
    week: number,
    taskType: TaskType
  ): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    let rowIndex = 0;

    for (const row of rows) {
      rowIndex++;
      if (+row.semana === week) break;
    }

    const row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    let cell: GoogleSpreadsheetCell;

    if (taskType === "Bathroom") cell = sheet.getCell(rowIndex, 1);
    else if (taskType === "LivingRoom") cell = sheet.getCell(rowIndex, 2);
    else cell = sheet.getCell(rowIndex, 3);

    if (this.cellsService.getTaskCellBackgroud(cell) === "Green") {
      this.logger.error("Already finished");
      // this.logger.error({ week, username, taskType, cell });
      throw new AlreadyCompletedTaskError("Already finised");
    }
    if (cell.value != username) {
      this.logger.error("Cell is not owned by user");
      this.logger.error({ week, username, taskType, cell });
      throw new Error("Cell is not owned by user");
    }

    this.cellsService.setGreenBackground(cell);
    await sheet.saveUpdatedCells();
    await this.redisService.delTasks();

    if (settings.awaitTableGeneration) await this.getTasksAsTable();
    else this.getTasksAsTable();
  }

  public async transferTask(
    usernameTo: string,
    week: number,
    taskType: TaskType
  ): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    let rowIndex = 0;

    for (const row of rows) {
      rowIndex++;
      if (+row.semana === week) break;
    }

    const row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    let cell: GoogleSpreadsheetCell;

    if (taskType === "Bathroom") cell = sheet.getCell(rowIndex, 1);
    else if (taskType === "LivingRoom") cell = sheet.getCell(rowIndex, 2);
    else cell = sheet.getCell(rowIndex, 3);

    cell.value = usernameTo;
    await sheet.saveUpdatedCells();
    await this.redisService.delTasks();

    if (settings.awaitTableGeneration) await this.getTasksAsTable();
    else this.getTasksAsTable();
  }

  private async notifyUsers(task: WeeklyTask) {
    const preMsg = "Tareas repartidas. Tu tarea semanal es: ";
    const bot: Telegraf = Container.get("bot");
    const logger: Logger = Container.get("logger");

    const bUser = await this.usersService.getUserByUsernameOrError(task.bathrooms);
    const lrUser = await this.usersService.getUserByUsernameOrError(task.livingRoom);
    const kUser = await this.usersService.getUserByUsernameOrError(task.kitchen);

    if (bUser.telegramID) {
      await bot.telegram.sendMessage(bUser.telegramID, preMsg + "Baños");
      logger.info(`User ${bUser.username} notified for bathroom`);
    }
    if (lrUser.telegramID) {
      await bot.telegram.sendMessage(lrUser.telegramID, preMsg + "Salón");
      logger.info(`User ${lrUser.username} notified for living room`);
    }
    if (kUser.telegramID) {
      await bot.telegram.sendMessage(kUser.telegramID, preMsg + "Cocina");
      logger.info(`User ${kUser.username} notified for kitchen`);
    }
  }

  public async createWeeklyTasks(notifyUsers = false): Promise<void> {
    const currentTasks = await this.getWeeklyTasks();

    if (!currentTasks.length) {
      const users = await this.usersService.getUsers();
      const usernames = users.map((e) => e.username);
      const task: WeeklyTask = {
        week: 1,
        bathrooms: usernames[0],
        livingRoom: usernames[1],
        kitchen: usernames[2]
      };
      await this.createWeeklyTask(task);
      if (notifyUsers) await this.notifyUsers(task);
      return;
    }

    // New tasks depends on first task
    // Warning: if first task has duplicates (a user has transferred its task), the algorithm fails
    
    const firstTask = currentTasks[0];
    const lastTask = currentTasks[currentTasks.length - 1];
    const firstWeek = firstTask.week;
    const nextWeek = lastTask.week + 1;

    const usernames = [
      firstTask.bathrooms.user,
      firstTask.livingRoom.user,
      firstTask.kitchen.user
    ];

    const newUsernames = this.arraysService.rotate(usernames, (nextWeek-firstWeek) % usernames.length);
    const task: WeeklyTask = {
      week: nextWeek,
      bathrooms: newUsernames[0],
      livingRoom: newUsernames[1],
      kitchen: newUsernames[2]
    };
    await this.createWeeklyTask(task);
    if (notifyUsers) await this.notifyUsers(task);
  }

  private taskStatusAsString(task: StatefulTask): string {
    if (task.done) return `${task.user}`;
    return `*${task.user}*`;
  }

  public async getTasksAsTable(): Promise<string | null> {
    const redisMemory = await this.redisService.getTasksTableURL();
    if (redisMemory) {
      if (redisMemory == "null") return null;
      return redisMemory;
    }

    const tasks = await this.getWeeklyTasks();
    const translatedTasks: DBIO[] = tasks
      .filter(
        (task) => !(task.bathrooms.done && task.kitchen.done && task.livingRoom.done)
      )
      .map((task) => {
        return {
          semana: task.week,
          baños: this.taskStatusAsString(task.bathrooms),
          cocina: this.taskStatusAsString(task.kitchen),
          salón: this.taskStatusAsString(task.livingRoom)
        };
      });

    if (!translatedTasks.length) {
      await this.redisService.setTasksTableURL("null");
      return null;
    }

    const newURL = await this.latex2pngService.genTableImageUrl(translatedTasks);
    if (newURL == "error") {
      this.logger.info("Error generating tasks table URL");
      return "error";
    }

    this.logger.info("Generated tasks table URL: " + newURL);
    await this.redisService.setTasksTableURL(newURL);
    return newURL;
  }
}
