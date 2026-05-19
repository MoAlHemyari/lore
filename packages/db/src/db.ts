import { drizzle } from "drizzle-orm/bun-sqlite"
import { Database } from "bun:sqlite"
import { DATABASE_URL } from "."

const client = new Database(DATABASE_URL)
export const db = drizzle({ client })
