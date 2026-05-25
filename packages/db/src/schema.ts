import { check, sqliteTable as table, type AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import type { SQLiteColumnBuilders } from "drizzle-orm/sqlite-core/columns/all"
import { sql } from "drizzle-orm"

import { questKinds, questLifecycleStatuses, type QuestKind, type QuestLifecycleStatus } from "@lore/core"
import { checkIN } from "./helpers"

// -----
// notes:
//
// 1. sqlite has no enums and drizzle enum is to infer `insert` and `select` types, not to check runtime values.
// since enum value is a tuple, and the goal is the ts types, the best way i found for the imported objects
// is as `Object.keys(questKinds) as [QuestKind]`. otherwise you will introduce unnecessary things.
// for the runtime enforcement, it'll be handled by CHECK constraint.
//
// 2. the default value if there is no explicit DEFAULT clause attached to a column definition is NULL.
//
// 3. i added the defaults for update and create not to be used but as a fallback. these values should be
// inserted from the caller, the interface specifically.
// -----

// -----
// this is shared between entities and identical with the `BaseCoreEntity` type
// NOTE: baseSchemaColumns must be initizlized before calling it, you will get this error when
// running `drizzle-kit generate:
//    "ReferenceError: Cannot access 'baseSchemaColumns' before initialization
// -----
const baseSchemaColumns = (t: SQLiteColumnBuilders) => ({
  id: t
    .text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),

  removedAt: t.text("removed_at"),
  updatedAt: t
    .text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  createdAt: t
    .text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull()
})

const baseSchemaCheckConstraints = <
  T extends {
    removedAt: AnySQLiteColumn
    createdAt: AnySQLiteColumn
  }
>(
  table: T
) => [
  // check if removed_at isn't null and has a valid sqlite datetime format
  check(
    "check_removed_at_format",
    sql`${table.removedAt} IS NULL OR datetime(${table.removedAt}) IS NOT NULL`
  ),
  check(
    "check_removed_at_after_created",
    sql`${table.removedAt} IS NULL OR ${table.removedAt} >= ${table.createdAt}`
  )
]

export const quests = table(
  "quests",
  (t) => ({
    title: t.text("title").notNull(),
    description: t.text("description").notNull().default(""),

    kind: t.text("kind", { enum: Object.keys(questKinds) as [QuestKind] }).notNull(),
    status: t
      .text("status", { enum: Object.keys(questLifecycleStatuses) as [QuestLifecycleStatus] })
      .notNull(),

    pausedAt: t.text("paused_at"),
    idledAt: t.text("idled_at"),
    abandonedAt: t.text("abandoned_at"),
    completedAt: t.text("completed_at"),

    ...baseSchemaColumns(t)
  }),
  (table) => [
    ...baseSchemaCheckConstraints(table),

    check("check_kind", checkIN(table.kind, Object.values(questKinds) as string[])),
    check("check_status", checkIN(table.status, Object.values(questLifecycleStatuses) as string[])),

    // check if timestamps have right format
    check(
      "check_paused_at_format",
      sql`${table.pausedAt} IS NULL OR datetime(${table.pausedAt}) IS NOT NULL`
    ),
    check("check_idled_at_format", sql`${table.idledAt} IS NULL OR datetime(${table.idledAt}) IS NOT NULL`),
    check(
      "check_abandoned_at_format",
      sql`${table.abandonedAt} IS NULL OR datetime(${table.abandonedAt}) IS NOT NULL`
    ),
    check(
      "check_completed_at_format",
      sql`${table.completedAt} IS NULL OR datetime(${table.completedAt}) IS NOT NULL`
    ),

    // check if timestamps are after the created at timestamp
    check(
      "check_paused_at_after_created",
      sql`${table.pausedAt} IS NULL OR ${table.pausedAt} >= ${table.createdAt}`
    ),
    check(
      "check_idled_at_after_created",
      sql`${table.idledAt} IS NULL OR ${table.idledAt} >= ${table.createdAt}`
    ),
    check(
      "check_abandoned_at_after_created",
      sql`${table.abandonedAt} IS NULL OR ${table.abandonedAt} >= ${table.createdAt}`
    ),
    check(
      "check_completed_at_after_created",
      sql`${table.completedAt} IS NULL OR ${table.completedAt} >= ${table.createdAt}`
    ),

    // check if status exists with its timestamp not null
    check(
      "check_paused_at_status",
      sql`${table.status} != '${sql.raw(questLifecycleStatuses.PAUSED)}' OR ${table.pausedAt} IS NOT NULL`
    ),
    check(
      "check_idled_at_status",
      sql`${table.status} != '${sql.raw(questLifecycleStatuses.IDLE)}' OR ${table.idledAt} IS NOT NULL`
    ),
    check(
      "check_abandoned_at_status",
      sql`${table.status} != '${sql.raw(questLifecycleStatuses.ABANDONED)}' OR ${table.abandonedAt} IS NOT NULL`
    ),
    check(
      "check_completed_at_status",
      sql`${table.status} != '${sql.raw(questLifecycleStatuses.COMPLETED)}' OR ${table.completedAt} IS NOT NULL`
    ),
    check(
      "check_removed_at_status",
      sql`${table.status} != '${sql.raw(questLifecycleStatuses.REMOVED)}' OR ${table.removedAt} IS NOT NULL`
    )
  ]
)

export const notes = table(
  "notes",
  (t) => ({
    questId: t.text("quest_id").references(() => quests.id),
    text: t.text().notNull(),

    ...baseSchemaColumns(t)
  }),
  (table) => [...baseSchemaCheckConstraints(table)]
)

export const progress = table(
  "progress",
  (t) => ({
    questId: t
      .text("quest_id")
      .references(() => quests.id)
      .notNull(),
    text: t.text().notNull(),

    ...baseSchemaColumns(t)
  }),
  (table) => [...baseSchemaCheckConstraints(table)]
)
