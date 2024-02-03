import { drizzle } from "drizzle-orm/mysql2";
import mysql, { ConnectionOptions } from "mysql2/promise";

import { schema } from "@acme/schema";

export * from "drizzle-orm";

const config: ConnectionOptions = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};

const connection = await mysql.createConnection(config);

export const db = drizzle(connection, { schema: schema, mode: "default" });
