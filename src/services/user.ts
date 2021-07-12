import { Inject, Service } from "typedi";
import { Connection } from "typeorm";
import { Logger } from "winston";
import { HTTPException } from "../interfaces/errors";
import { UserRegisterInput } from "../interfaces/user";
import { User } from "../models/user";

@Service()
export default class UserService {
  constructor(
    @Inject("logger") private logger: Logger,
    @Inject("Connection") private connection: Connection
  ) {}

  public async getUserByID(id: number): Promise<User | undefined> {
    const userRepo = this.connection.getRepository(User);
    return await userRepo.findOne(id);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const userRepo = this.connection.getRepository(User);
    return await userRepo.findOne({ email: email });
  }

  public async createUser(userInput: UserRegisterInput): Promise<User> {
    if (await this.getUserByEmail(userInput.email))
      throw new HTTPException("email already registered", 400);

    this.logger.silly("Creating user db record");
    const user = new User(userInput.name, userInput.email);
    const userRepo = this.connection.getRepository(User);
    await userRepo.save(user);
    return user;
  }

  public async getUsers(): Promise<User[]> {
    const userRepo = this.connection.getRepository(User);
    return await userRepo.find();
  }
}
