import type { Config } from "drizzle-kit";

const uri = [
  "mysql://",
  process.env.DB_USERNAME,
  ":",
  process.env.DB_PASSWORD,
  "@",
  process.env.DB_HOST,
  ":3306/",
  process.env.DB_NAME,
].join("");

export default {
  schema: "../schema/src/schema",
  driver: "mysql2",
  dbCredentials: { uri },
  tablesFilter: ["acme_*"],
} satisfies Config;
