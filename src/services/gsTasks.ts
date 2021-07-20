import { GoogleSpreadsheet, GoogleSpreadsheetCell } from "google-spreadsheet";
import { Telegraf } from "telegraf";
import Container, { Inject, Service } from "typedi";
import { Logger } from "winston";
import settings from "../config";
import GSUsersService from "./gsUsers";

interface AssignedTask {
  week: number;
  bathrooms: string;
  livingRoom: string;
  kitchen: string;
}

interface AdvancedSingleTask {
  user: string;
  done: boolean;
}

interface AdvancedAssignedTask {
  week: number;
  bathrooms: AdvancedSingleTask;
  livingRoom: AdvancedSingleTask;
  kitchen: AdvancedSingleTask;
}

export type TaskType = "Bathroom" | "LivingRoom" | "Kitchen";

interface UserTask {
  week: number;
  taskName: string;
  taskType: TaskType;
}

interface DBInput {
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
    @Inject() private usersService: GSUsersService
  ) {}

  private processSingleTaskCell(
    cell: GoogleSpreadsheetCell
  ): AdvancedSingleTask {
    const style = cell.effectiveFormat.backgroundColor;
    const done = !(style.red === 1 && style.green === 1 && style.blue === 1);
    const user = String(cell.value);
    return { user, done };
  }

  private setGreenBackground(cell: GoogleSpreadsheetCell) {
    cell.backgroundColor = { red: 0, green: 1, blue: 0, alpha: 1 };
  }
  private setWhiteBackground(cell: GoogleSpreadsheetCell) {
    cell.backgroundColor = { red: 1, green: 1, blue: 1, alpha: 1 };
  }

  private getBackground(cell: GoogleSpreadsheetCell): "White" | "Green" {
    const { done } = this.processSingleTaskCell(cell);
    return done ? "Green" : "White";
  }

  public async createAssignedTask(assignedTask: AssignedTask) {
    const sheet = this.doc.sheetsById[this.sheetID];
    const newRow: DBInput = {
      semana: assignedTask.week,
      baños: assignedTask.bathrooms,
      salón: assignedTask.livingRoom,
      cocina: assignedTask.kitchen,
    };
    await sheet.addRow(newRow as any);
    this.logger.info(`Created task: ${JSON.stringify(newRow)}`);
  }

  public async getUserActiveAssignedTasks(
    username: string
  ): Promise<UserTask[]> {
    const assignedTasks = await this.getAssignedTasks();
    const filteredTasks: UserTask[] = [];

    for (const task of assignedTasks) {
      if (task.bathrooms.user === username && !task.bathrooms.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Baños",
          taskType: "Bathroom",
        });
      if (task.livingRoom.user === username && !task.livingRoom.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Salón",
          taskType: "LivingRoom",
        });
      if (task.kitchen.user === username && !task.kitchen.done)
        filteredTasks.push({
          week: task.week,
          taskName: "Cocina",
          taskType: "Kitchen",
        });
    }

    return filteredTasks;
  }

  public async getAssignedTasks(): Promise<AdvancedAssignedTask[]> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    const data: AdvancedAssignedTask[] = [];

    for (let i: number = 0; i < rows.length; i++) {
      let row = rows[i];
      await sheet.loadCells(row.a1Range.split("!")[1]);

      const week = sheet.getCell(i + 1, 0);
      const bathrooms = sheet.getCell(i + 1, 1);
      const livingRoom = sheet.getCell(i + 1, 2);
      const kitchen = sheet.getCell(i + 1, 3);
      data.push({
        week: +week.value,
        bathrooms: this.processSingleTaskCell(bathrooms),
        livingRoom: this.processSingleTaskCell(livingRoom),
        kitchen: this.processSingleTaskCell(kitchen),
      });
    }
    return data;
  }

  public async finishTask(
    username: string,
    week: number,
    taskType: TaskType
  ): Promise<void> {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    let rowIndex = 0;

    for (let row of rows) {
      rowIndex++;
      if (+row.semana === week) break;
    }

    let row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    let cell: GoogleSpreadsheetCell;

    if (taskType === "Bathroom") cell = sheet.getCell(rowIndex, 1);
    else if (taskType === "LivingRoom") cell = sheet.getCell(rowIndex, 2);
    else cell = sheet.getCell(rowIndex, 3);

    if (this.getBackground(cell) === "Green") {
      console.error("Already finished");
      console.error({ week, username, taskType, cell });
      throw new Error("Already finised");
    }
    if (cell.value != username) {
      console.error("Cell is not owned by user");
      console.error({ week, username, taskType, cell });
      throw new Error("Cell is not owned by user");
    }

    this.setGreenBackground(cell);
    await sheet.saveUpdatedCells();
  }

  public async transfer(usernameTo: string, week: number, taskType: TaskType) {
    const sheet = this.doc.sheetsById[this.sheetID];
    const rows = await sheet.getRows();
    let rowIndex = 0;

    for (let row of rows) {
      rowIndex++;
      if (+row.semana === week) break;
    }

    let row = rows[rowIndex - 1];
    await sheet.loadCells(row.a1Range.split("!")[1]);

    let cell: GoogleSpreadsheetCell;

    if (taskType === "Bathroom") cell = sheet.getCell(rowIndex, 1);
    else if (taskType === "LivingRoom") cell = sheet.getCell(rowIndex, 2);
    else cell = sheet.getCell(rowIndex, 3);

    cell.value = usernameTo;
    await sheet.saveUpdatedCells();
  }

  private shuffleArray<Type>(array: Type[]): Type[] {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  private rotate<T>(array: T[], times: number = 1): T[] {
    while (times--) {
      var temp = array.shift() as T;
      array.push(temp);
    }
    return array;
  }

  private async notifyUsers(task: AssignedTask) {
    const preMsg = "Tareas repartidas. Tu tarea semanal es: ";
    const bot: Telegraf = Container.get("bot");
    const logger: Logger = Container.get("logger");

    const bUser = await this.usersService.getUserByUsernameOrError(
      task.bathrooms
    );
    const lrUser = await this.usersService.getUserByUsernameOrError(
      task.livingRoom
    );
    const kUser = await this.usersService.getUserByUsernameOrError(
      task.kitchen
    );

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

  public async createWeeklyTasks(notifyUsers = false) {
    const currentTasks = await this.getAssignedTasks();
    const users = await this.usersService.getUsers();
    const usernames = users.map((e) => e.username);

    if (!currentTasks.length) {
      const task: AssignedTask = {
        week: 1,
        bathrooms: usernames[0],
        livingRoom: usernames[1],
        kitchen: usernames[2],
      };
      await this.createAssignedTask(task);
      if (notifyUsers) await this.notifyUsers(task);
      return;
    }

    const lastTask = currentTasks[currentTasks.length - 1];
    const nextWeek = lastTask.week + 1;

    const lastUsers = [
      lastTask.bathrooms.user,
      lastTask.kitchen.user,
      lastTask.livingRoom.user,
    ];
    const newUsers = this.rotate(usernames, (nextWeek - 1) % lastUsers.length);
    const task: AssignedTask = {
      week: nextWeek,
      bathrooms: newUsers[0],
      livingRoom: newUsers[1],
      kitchen: newUsers[2],
    };
    await this.createAssignedTask(task);
    if (notifyUsers) await this.notifyUsers(task);
  }
}
