import { drizzle } from "drizzle-orm/mysql2";
import mysql, { ConnectionOptions } from "mysql2/promise";

import * as post from "./schema/post";

export const schema = { ...post };

export { mySqlTable as tableCreator } from "./schema/_table";

export * from "drizzle-orm";

const config: ConnectionOptions = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
};
const connection = await mysql.createConnection(config);

export const db = drizzle(connection, { schema: schema, mode: "default" });
