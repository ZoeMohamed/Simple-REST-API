// TypeORM data source used by CLI commands and migrations.

import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Post } from "../posts/entities/post.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Enable SSL when required by the database provider (e.g., Render external connections).
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  entities: [User, Post],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
});
