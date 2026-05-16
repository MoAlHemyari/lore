import { sqliteTable as table } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

import {
  questKinds,
  questLifecycleStatuses,
  type QuestKind,
  type QuestLifecycleStatus
} from "../../core/src/entities"

// notes:
// 1. sqlite has no enums. drizzle enum is to infer `insert` and `select` types, not to check runtime values.
// since enum value is a tuple, and the goal is the ts types, the best way i found for the imported objects
// is as `Object.keys(questKinds) as [QuestKind]`. otherwise you will introduce unnecessary things.
// 2. the default value if there is no explicit DEFAULT clause attached to a column definition is NULL.
// 3. i added the defaults for update and create not to be used but as a fallback. these values should be
// inserted from the caller, the interface specifically.

export const quests = table("quests", (t) => ({
  id: t.text("id").primaryKey(),

  kind: t.text("kind", { enum: Object.keys(questKinds) as [QuestKind] }).notNull(),
  title: t.text("title").notNull(),
  description: t.text("description").default(""),

  status: t.text("status", { enum: Object.keys(questLifecycleStatuses) as [QuestLifecycleStatus] }),
  pausedAt: t.integer("paused_at", { mode: "timestamp" }),
  idledAt: t.integer("idled_at", { mode: "timestamp" }),
  abandonedAt: t.integer("abandoned_at", { mode: "timestamp" }),
  completedAt: t.integer("completed_at", { mode: "timestamp" }),

  removedAt: t.integer("removed_at", { mode: "timestamp" }),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`)
}))

export const notes = table("notes", (t) => ({
  id: t.text("id").primaryKey(),

  questId: t.text("quest_id").references(() => quests.id),
  text: t.text().notNull(),

  removedAt: t.integer("removed_at", { mode: "timestamp" }),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`)
}))

export const progress = table("progress", (t) => ({
  id: t.text("id").primaryKey(),

  questId: t
    .text("quest_id")
    .references(() => quests.id)
    .notNull(),
  text: t.text().notNull(),

  removedAt: t.integer("removed_at", { mode: "timestamp" }),
  updatedAt: t.integer("updated_at", { mode: "timestamp" }).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  createdAt: t.integer("created_at", { mode: "timestamp" }).default(sql`(CURRENT_TIMESTAMP)`)
}))
