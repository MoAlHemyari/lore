import type { SQLiteColumn } from "drizzle-orm/sqlite-core"

/**
 * Generates an SQL check constraint for an IN operator.
 *
 * @param c - The SQLite column to check.
 * @param opts - An array of valid string values for the column.
 * @returns A string representing the SQL IN expression.
 */
export const checkIN = (c: SQLiteColumn, opts: string[]) =>
  `${c} IN (${opts.map((o) => `'${o}'`).join(", ")})`
