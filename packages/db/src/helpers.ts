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

/**
 * Safely executes a database query operation.
 *
 * @param operation - Query operation to execute.
 * @returns Successful value or thrown error.
 */
type SafeQueryResult<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: Error
    }
export function safeQuery<T>(operation: () => T): SafeQueryResult<T> {
  try {
    return { ok: true, value: operation() }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}
