import { Inject, Service } from "typedi";
import { Logger } from "winston";

@Service()
export default class UserService {
  constructor(@Inject("logger") private logger: Logger) {}

  public async getUserByID() {}

  public async getUserByEmail() {}

  public async createUser() {}

  public async getUsers() {}
}
