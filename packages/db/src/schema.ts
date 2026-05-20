import { check, sqliteTable as table } from "drizzle-orm/sqlite-core"
import type { SQLiteColumnBuilders } from "drizzle-orm/sqlite-core/columns/all"
import { sql } from "drizzle-orm"

import {
  questKinds,
  questLifecycleStatuses,
  type QuestKind,
  type QuestLifecycleStatus
} from "../../core/src/entities"
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
  id: t.text("id").primaryKey(),

  removedAt: t.integer("removed_at", { mode: "timestamp" }),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`)
})

export const quests = table(
  "quests",
  (t) => ({
    title: t.text("title").notNull(),
    description: t.text("description").notNull().default(""),

    kind: t.text("kind", { enum: Object.keys(questKinds) as [QuestKind] }).notNull(),
    status: t.text("status", { enum: Object.keys(questLifecycleStatuses) as [QuestLifecycleStatus] }),

    pausedAt: t.integer("paused_at", { mode: "timestamp" }),
    idledAt: t.integer("idled_at", { mode: "timestamp" }),
    abandonedAt: t.integer("abandoned_at", { mode: "timestamp" }),
    completedAt: t.integer("completed_at", { mode: "timestamp" }),

    ...baseSchemaColumns(t)
  }),
  (table) => [
    check("check_kind", checkIN(table.kind, Object.values(questKinds) as string[])),
    check("check_status", checkIN(table.status, Object.values(questLifecycleStatuses) as string[]))
  ]
)

export const notes = table("notes", (t) => ({
  questId: t.text("quest_id").references(() => quests.id),
  text: t.text().notNull(),

  ...baseSchemaColumns(t)
}))

export const progress = table("progress", (t) => ({
  questId: t
    .text("quest_id")
    .references(() => quests.id)
    .notNull(),
  text: t.text().notNull(),

  ...baseSchemaColumns(t)
}))
