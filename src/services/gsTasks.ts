import axios from "axios";
import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";
import tableToLatex from "make-latex";
import { Telegraf } from "telegraf";
import Container, { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import ArraysService from "./arrays";
import CellsService from "./cells";
import GSUsersService from "./gsUsers";
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
  sheetID = settings.google_sheets_ids.tasks;

  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("doc") private doc: GoogleSpreadsheet,
    @Inject() private usersService: GSUsersService,
    @Inject() private cellsService: CellsService,
    @Inject() private arraysService: ArraysService,
    @Inject() private redisService: RedisService
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
      this.logger.error({ week, username, taskType, cell });
      throw new Error("Already finised");
    }
    if (cell.value != username) {
      this.logger.error("Cell is not owned by user");
      this.logger.error({ week, username, taskType, cell });
      throw new Error("Cell is not owned by user");
    }

    this.cellsService.setGreenBackground(cell);
    await sheet.saveUpdatedCells();
    await this.redisService.delTasks();
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
    const users = await this.usersService.getUsers();
    const usernames = users.map((e) => e.username);

    if (!currentTasks.length) {
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

    const lastTask = currentTasks[currentTasks.length - 1];
    const nextWeek = lastTask.week + 1;

    const newUsers = this.arraysService.rotate(
      usernames,
      (nextWeek - 1) % users.length
    );
    const task: WeeklyTask = {
      week: nextWeek,
      bathrooms: newUsers[0],
      livingRoom: newUsers[1],
      kitchen: newUsers[2]
    };
    await this.createWeeklyTask(task);
    if (notifyUsers) await this.notifyUsers(task);
  }

  private taskStatusAsString(task: StatefulTask): string {
    if (task.done) return `${task.user}`;
    return `*${task.user}*`;
  }

  public async getTasksAsTable(): Promise<string> {
    const redisMemory = await this.redisService.getTasksTableURL();
    if (redisMemory) return redisMemory;

    const tasks = await this.getWeeklyTasks();
    const translatedTasks: DBIO[] = tasks.slice(-2).map((task) => {
      return {
        semana: task.week,
        baños: this.taskStatusAsString(task.bathrooms),
        cocina: this.taskStatusAsString(task.kitchen),
        salón: this.taskStatusAsString(task.livingRoom)
      };
    });
    const latexTable = tableToLatex(translatedTasks);
    const regex = /\\begin{tabular}{c+}\s([{}\s&\\\-\wñáéíóú*]+)\\end{tabular}/;
    const match = regex.exec(latexTable);
    if (!match) throw new Error(latexTable);

    let filteredTable = `
    \\begin{tabular}{cccc}
    \\hline
    ${match[1]}
    \\hline
    \\end{tabular}
    `;
    filteredTable = filteredTable
      .replace("á", "\\'{a}")
      .replace("é", "\\'{e}")
      .replace("í", "\\'{i}")
      .replace("ó", "\\'{o}")
      .replace("ú", "\\'{u}")
      .replace("ñ", "\\~{n}");

    const response = await axios.post(
      "http://latex2png.com/api/convert",
      {
        auth: { user: "guest", password: "guest" },
        latex: filteredTable,
        resolution: 600,
        color: "000000"
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    if (response.data.url === undefined) {
      throw new Error("Invalid image generation");
    }

    const newURL = "http://latex2png.com" + response.data.url;
    await this.redisService.setTasksTableURL(newURL);
    return newURL;
  }
}
