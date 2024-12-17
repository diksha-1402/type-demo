import { DataSource } from "typeorm";
import { User } from "../entities/user.entities";
import { Session } from "../entities/session.entities";
import dotenv from "dotenv";
dotenv.config();

let db = new DataSource({
  type: process.env.DB_TYPE as any ,
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT || "5432"), 
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  logging: true,
  synchronize: true,
  entities: [User,Session],
});

export default db;
