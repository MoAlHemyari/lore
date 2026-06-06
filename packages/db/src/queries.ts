import type { Database } from "bun:sqlite"
import { asc, desc, eq, or, like, type ExtractTablesWithRelations, type RequireAtLeastOne } from "drizzle-orm"
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core"
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite"
import { type Note, type Progress, type Quest } from "@lore/core"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"
import type { DBError } from "./errors"
import { mapNoteDBToDomain, mapProgressDBToDomain, mapQuestDBToDomain } from "./parsers"
import { safeQuery } from "./helpers"

const operations = [
  // quest operations
  "quests_get_all",
  "quests_get_by_id",
  "quests_insert",
  "quests_update",
  "quests_remove_cascade",
  "quests_delete_all",
  "quests_delete_by_id",

  // notes operations
  "notes_get_all",
  "notes_get_by_id",
  "notes_insert",
  "notes_update",
  "notes_delete_all",
  "notes_delete_by_id",

  // progress operations
  "progresses_get_all",
  "progresses_get_by_id",
  "progresses_insert",
  "progresses_update",
  "progresses_delete_all",
  "progresses_delete_by_id"
] as const
type OperationKind = (typeof operations)[number]

type OperationResult<T> =
  | {
      ok: true
      operation: OperationKind
      value: T
    }
  | {
      ok: false
      operation: OperationKind
      error: DBError
    }

const DEFAULT_PAGE_SIZE = 10

type GenericOrderByFields = "createdAt" | "updatedAt"

type QuestOrderByFields = GenericOrderByFields | "kind" | "status"
export function getQuests(
  parameters: {
    search?: string
    page?: number
    pageSize?: number
    order?: {
      sort: "asc" | "desc"
      field: QuestOrderByFields
    }
  } = {}
): OperationResult<Quest[]> {
  const {
    search = "",
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    order = {
      sort: "desc",
      field: "createdAt"
    }
  } = parameters

  let q
  const baseQuery = db
    .select()
    .from(questsTable)
    .orderBy(order.sort === "asc" ? asc(questsTable[order.field]) : desc(questsTable[order.field]))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  if (parameters.search) {
    q = safeQuery(() =>
      baseQuery
        .where(or(like(questsTable.title, `%${search}%`), like(questsTable.description, `%${search}`)))
        .all()
    )
  } else q = safeQuery(() => baseQuery.all())

  if (!q.ok) return { ok: false, operation: "quests_get_all", error: q.error }

  const selectedRows = q.value

  const quests: Quest[] = []
  for (const row of selectedRows) {
    const m = mapQuestDBToDomain(row)
    if (!m.ok) return { ok: false, operation: "quests_get_all", error: { code: m.error } }

    quests.push(m.value)
  }

  return {
    ok: true,
    operation: "quests_get_all",
    value: quests
  }
}

type NotesOrderByFields = GenericOrderByFields | "questId"
export function getNotes(
  parameters: {
    search?: string
    page?: number
    pageSize?: number
    order?: {
      sort: "asc" | "desc"
      field: NotesOrderByFields
    }
  } = {}
): OperationResult<Note[]> {
  const {
    search = "",
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    order = {
      sort: "desc",
      field: "createdAt"
    }
  } = parameters

  let q
  const baseQuery = db
    .select()
    .from(notesTable)
    .orderBy(order.sort === "asc" ? asc(notesTable[order.field]) : desc(notesTable[order.field]))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  if (search) q = safeQuery(() => baseQuery.where(like(notesTable.text, `%${search}%`)).all())
  else q = safeQuery(() => baseQuery.all())

  if (!q.ok) return { ok: false, operation: "notes_get_all", error: q.error }

  const selectedRows = q.value

  const notes: Note[] = []
  for (const row of selectedRows) {
    const m = mapNoteDBToDomain(row)
    if (!m.ok) return { ok: false, operation: "notes_get_all", error: { code: m.error } }

    notes.push(m.value)
  }

  return {
    ok: true,
    operation: "notes_get_all",
    value: notes
  }
}

type ProgressOrderByFields = GenericOrderByFields | "questId"
export function getProgresses(
  parameters: {
    search?: string
    page?: number
    pageSize?: number
    order?: {
      sort: "asc" | "desc"
      field: ProgressOrderByFields
    }
  } = {}
): OperationResult<Progress[]> {
  const {
    search = "",
    page = 0,
    pageSize = DEFAULT_PAGE_SIZE,
    order = {
      sort: "desc",
      field: "createdAt"
    }
  } = parameters

  let q
  const baseQuery = db
    .select()
    .from(progressTable)
    .orderBy(order.sort === "asc" ? asc(progressTable[order.field]) : desc(progressTable[order.field]))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  if (search) q = safeQuery(() => baseQuery.where(like(progressTable.text, `%${search}%`)).all())
  else q = safeQuery(() => baseQuery.all())

  if (!q.ok) return { ok: false, operation: "progresses_get_all", error: q.error }

  const selectedRows = q.value

  const progresses: Progress[] = []
  for (const row of selectedRows) {
    const m = mapProgressDBToDomain(row)
    if (!m.ok) return { ok: false, operation: "progresses_get_all", error: { code: m.error } }

    progresses.push(m.value)
  }

  return {
    ok: true,
    operation: "progresses_get_all",
    value: progresses
  }
}

export function getQuestById(id: Quest["id"]): OperationResult<Quest | null> {
  const q = safeQuery(() => db.select().from(questsTable).where(eq(questsTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "quests_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "quests_get_by_id", value: null }

  const m = mapQuestDBToDomain(selectedRow)
  if (!m.ok) return { ok: false, operation: "quests_get_by_id", error: { code: m.error } }

  return { ok: true, operation: "quests_get_by_id", value: m.value }
}

export function getNoteById(id: Note["id"]): OperationResult<Note | null> {
  const q = safeQuery(() => db.select().from(notesTable).where(eq(notesTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "notes_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "notes_get_by_id", value: null }

  const m = mapNoteDBToDomain(selectedRow)
  if (!m.ok) return { ok: false, operation: "notes_get_by_id", error: { code: m.error } }

  return { ok: true, operation: "notes_get_by_id", value: m.value }
}

export function getProgressById(id: Progress["id"]): OperationResult<Progress | null> {
  const q = safeQuery(() => db.select().from(progressTable).where(eq(progressTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "progresses_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "progresses_get_by_id", value: null }

  const m = mapProgressDBToDomain(selectedRow)
  if (!m.ok) return { ok: false, operation: "progresses_get_by_id", error: { code: m.error } }

  return { ok: true, operation: "progresses_get_by_id", value: m.value }
}

// mutations
export type CreateQuestValues = {
  title: Quest["title"]
  kind: Quest["kind"]
  description: Quest["description"]
  status: Quest["status"]
}
export function insertQuest(values: CreateQuestValues): OperationResult<Quest> {
  const q = safeQuery(() => db.insert(questsTable).values(values).returning().get())
  if (!q.ok) return { ok: false, operation: "quests_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "quests_insert", error: { code: "FAILED_TO_INSERT" } }

  const m = mapQuestDBToDomain(insertedRow)
  if (!m.ok) return { ok: false, operation: "quests_insert", error: { code: m.error } }

  return { ok: true, operation: "quests_insert", value: m.value }
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export function insertNote(note: CreateNoteValue): OperationResult<Note> {
  const q = safeQuery(() => db.insert(notesTable).values(note).returning().get())
  if (!q.ok) return { ok: false, operation: "notes_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "notes_insert", error: { code: "FAILED_TO_INSERT" } }

  const m = mapNoteDBToDomain(insertedRow)
  if (!m.ok) return { ok: false, operation: "notes_insert", error: { code: m.error } }

  return { ok: true, operation: "notes_insert", value: m.value }
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export function insertProgress(progress: CreateProgress): OperationResult<Progress> {
  const q = safeQuery(() => db.insert(progressTable).values(progress).returning().get())
  if (!q.ok) return { ok: false, operation: "progresses_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "progresses_insert", error: { code: "FAILED_TO_INSERT" } }

  const m = mapProgressDBToDomain(insertedRow)
  if (!m.ok) return { ok: false, operation: "progresses_insert", error: { code: m.error } }

  return { ok: true, operation: "progresses_insert", value: m.value }
}

export type UpdateQuestValues = RequireAtLeastOne<Pick<Quest, "kind" | "title" | "description" | "status">>
export function updateQuest(
  id: Quest["id"],
  values: UpdateQuestValues,
  mode: "restore" | "default" = "default"
): OperationResult<Quest> {
  if (Object.values(values).length === 0)
    return { ok: false, operation: "quests_update", error: { code: "NO_FIELDS_TO_UPDATE" } }

  const normalizedValues: Partial<typeof questsTable.$inferInsert> = {}
  if (values.kind) normalizedValues.kind = values.kind
  if (values.title) normalizedValues.title = values.title
  if (values.description) normalizedValues.description = values.description
  if (mode === "restore" && !("status" in values)) normalizedValues.status = "active"
  if (values.status) {
    normalizedValues.status = values.status

    const t = new Date().toISOString()
    if (values.status === "abandoned") normalizedValues.abandonedAt = t
    if (values.status === "completed") normalizedValues.completedAt = t
    if (values.status === "idle") normalizedValues.idledAt = t
    if (values.status === "paused") normalizedValues.pausedAt = t
    if (values.status === "removed") normalizedValues.removedAt = t
    if (values.status === "active" && mode === "restore") normalizedValues.removedAt = null
  }

  let updatedRow

  if (values.status === "removed" || mode === "restore") {
    // remove or restore flow
    updatedRow = db.transaction((tx) => {
      const qQuest = safeQuery(() =>
        tx.update(questsTable).set(normalizedValues).where(eq(questsTable.id, id)).returning().get()
      )
      if (!qQuest.ok) return tx.rollback()

      const updatedQuestRow = qQuest.value
      if (!updatedQuestRow) return tx.rollback()

      const qNotes = safeQuery(() =>
        tx
          .update(notesTable)
          .set({ removedAt: normalizedValues.removedAt })
          .where(eq(notesTable.questId, id))
          .returning()
          .all()
      )

      if (!qNotes.ok) return tx.rollback()

      const qProgress = safeQuery(() =>
        tx
          .update(progressTable)
          .set({ removedAt: normalizedValues.removedAt })
          .where(eq(progressTable.questId, id))
          .returning()
          .all()
      )

      if (!qProgress.ok) return tx.rollback()

      return updatedQuestRow
    })
  } else {
    // not remove or restore flow
    const q = safeQuery(() =>
      db.update(questsTable).set(normalizedValues).where(eq(questsTable.id, id)).returning().get()
    )
    if (!q.ok) return { ok: false, operation: "quests_update", error: q.error }

    updatedRow = q.value
    if (!updatedRow) return { ok: false, operation: "quests_update", error: { code: "FAILED_TO_UPDATE" } }
  }

  const m = mapQuestDBToDomain(updatedRow)
  if (!m.ok) return { ok: false, operation: "quests_update", error: { code: m.error } }

  return { ok: true, operation: "quests_update", value: m.value }
}

type Executer =
  | (BunSQLiteDatabase<Record<string, never>> & {
      $client: Database
    })
  | SQLiteTransaction<"sync", void, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>

export type UpdateNoteValues = RequireAtLeastOne<Note, "text" | "removedAt">
export function updateNote(
  executer: Executer = db,
  id: Note["id"],
  values: UpdateNoteValues
): OperationResult<Note> {
  if (Object.values(values).length === 0)
    return { ok: false, operation: "notes_update", error: { code: "NO_FIELDS_TO_UPDATE" } }

  const normalizedValues: Partial<Pick<typeof notesTable.$inferInsert, "text" | "removedAt">> = {}
  if ("text" in values) normalizedValues.text = values.text // note: `if (values.text)` skips empty string
  if (values.removedAt) normalizedValues.removedAt = values.removedAt.toISOString()
  if (values.removedAt === null) normalizedValues.removedAt = null

  const q = safeQuery(() =>
    executer.update(notesTable).set(normalizedValues).where(eq(notesTable.id, id)).returning().get()
  )
  if (!q.ok) return { ok: false, operation: "notes_update", error: q.error }

  const updatedRow = q.value
  if (!updatedRow) return { ok: false, operation: "notes_update", error: { code: "FAILED_TO_UPDATE" } }

  const m = mapNoteDBToDomain(updatedRow)
  if (!m.ok) return { ok: false, operation: "notes_update", error: { code: m.error } }

  return { ok: true, operation: "notes_update", value: m.value }
}

export type UpdateProgressValues = RequireAtLeastOne<Pick<Progress, "text" | "removedAt">>
export function updateProgress(
  executer: Executer = db,
  id: Progress["id"],
  values: UpdateProgressValues
): OperationResult<Progress> {
  if (Object.values(values).length === 0)
    return { ok: false, operation: "progresses_update", error: { code: "NO_FIELDS_TO_UPDATE" } }

  const normalizedValues: Partial<Pick<typeof progressTable.$inferInsert, "text" | "removedAt">> = {}
  if ("text" in values) normalizedValues.text = values.text // note: `if (values.text)` skips empty string
  if (values.removedAt) normalizedValues.removedAt = values.removedAt.toISOString()
  if (values.removedAt === null) normalizedValues.removedAt = null

  const q = safeQuery(() =>
    executer.update(progressTable).set(normalizedValues).where(eq(progressTable.id, id)).returning().get()
  )
  if (!q.ok) return { ok: false, operation: "progresses_update", error: q.error }

  const updatedRow = q.value
  if (!updatedRow) return { ok: false, operation: "progresses_update", error: { code: "FAILED_TO_UPDATE" } }

  const m = mapProgressDBToDomain(updatedRow)
  if (!m.ok) return { ok: false, operation: "progresses_update", error: { code: m.error } }

  return { ok: true, operation: "progresses_update", value: m.value }
}

export function wipeAllQuestsTableRows(): OperationResult<Quest["id"][]> {
  const q = safeQuery(() => db.delete(questsTable).returning({ id: questsTable.id }).all())
  if (!q.ok) return { ok: false, operation: "quests_delete_all", error: q.error }

  const deletedRowIDs = q.value
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "quests_delete_all", value: flattenedArray }
}

export function wipeAllNotesTableRows(): OperationResult<Note["id"][]> {
  const q = safeQuery(() => db.delete(notesTable).returning({ id: notesTable.id }).all())
  if (!q.ok) return { ok: false, operation: "notes_delete_all", error: q.error }

  const deletedRowIDs = q.value
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "notes_delete_all", value: flattenedArray }
}

export function wipeAllProgressTableRows(): OperationResult<Progress["id"][]> {
  const q = safeQuery(() => db.delete(progressTable).returning({ id: progressTable.id }).all())
  if (!q.ok) return { ok: false, operation: "progresses_delete_all", error: q.error }

  const deletedRowIDs = q.value
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "progresses_delete_all", value: flattenedArray }
}

export function deleteQuestById(id: Quest["id"]): OperationResult<Quest["id"]> {
  const q = safeQuery(() =>
    db.delete(questsTable).where(eq(questsTable.id, id)).returning({ id: questsTable.id }).get()
  )
  if (!q.ok) return { ok: false, operation: "quests_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow) return { ok: false, operation: "quests_delete_by_id", error: { code: "FAILED_TO_DELETE" } }

  return { ok: true, operation: "quests_delete_by_id", value: deletedRow.id }
}

export function deleteNoteById(id: Note["id"]): OperationResult<Note["id"]> {
  const q = safeQuery(() =>
    db.delete(notesTable).where(eq(notesTable.id, id)).returning({ id: notesTable.id }).get()
  )
  if (!q.ok) return { ok: false, operation: "notes_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow) return { ok: false, operation: "notes_delete_by_id", error: { code: "FAILED_TO_DELETE" } }

  return { ok: true, operation: "notes_delete_by_id", value: deletedRow.id }
}

export function deleteProgressById(id: Progress["id"]): OperationResult<Progress["id"]> {
  const q = safeQuery(() =>
    db.delete(progressTable).where(eq(progressTable.id, id)).returning({ id: progressTable.id }).get()
  )
  if (!q.ok) return { ok: false, operation: "progresses_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow)
    return { ok: false, operation: "progresses_delete_by_id", error: { code: "FAILED_TO_DELETE" } }

  return { ok: true, operation: "progresses_delete_by_id", value: deletedRow.id }
}

// soft delete functions
export function removeQuest(id: Quest["id"]) {
  return updateQuest(id, { status: "removed" })
}

export function removeNote(id: Note["id"]) {
  return updateNote(db, id, { removedAt: new Date() })
}

export function removeProgress(id: Progress["id"]) {
  return updateProgress(db, id, { removedAt: new Date() })
}

export function restoreQuest(id: Quest["id"]) {
  return updateQuest(id, { status: "active" }, "restore")
}

export function restoreNote(id: Note["id"]) {
  return updateNote(db, id, { removedAt: null })
}

export function restoreProgress(id: Progress["id"]) {
  return updateProgress(db, id, { removedAt: null })
}
