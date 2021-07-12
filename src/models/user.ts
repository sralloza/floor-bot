import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["id", "name", "email"])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string;

  @Column()
  email: string;

  constructor(name: string, email: string) {
    this.name = name
    this.email = email
  }
}
