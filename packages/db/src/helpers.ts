import { sql } from "drizzle-orm"
import type { SQLiteColumn } from "drizzle-orm/sqlite-core"

/**
 * Generates an SQL check constraint for an IN operator.
 *
 * @param c - The SQLite column to check.
 * @param opts - An array of valid string values for the column.
 * @returns A Drizzle SQL expression representing the SQL IN check.
 */
export const checkIN = (c: SQLiteColumn, opts: string[]) =>
  sql`${c} IN (${sql.raw(opts.map((o) => `'${o}'`).join(", "))})`
