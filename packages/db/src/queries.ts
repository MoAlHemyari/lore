import type { Database } from "bun:sqlite"
import { asc, desc, eq, type ExtractTablesWithRelations, type RequireAtLeastOne } from "drizzle-orm"
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
  "quest_get_by_id",
  "quest_insert",
  "quest_update",
  "quest_remove_cascade",
  "quest_delete_all",
  "quest_delete_by_id",

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
  page: number = 0,
  pageSize: number = DEFAULT_PAGE_SIZE,
  order: {
    sort: "asc" | "desc"
    field: QuestOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  }
): OperationResult<Quest[]> {
  const q = safeQuery(() =>
    db
      .select()
      .from(questsTable)
      .orderBy(order.sort === "asc" ? asc(questsTable[order.field]) : desc(questsTable[order.field]))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all()
  )
  if (!q.ok) return { ok: false, operation: "quests_get_all", error: q.error }

  const selectedRows = q.value

  const quests: Quest[] = []
  for (const row of selectedRows) {
    const result = mapQuestDBToDomain(row)
    if (!result.ok) return { ok: false, operation: "quests_get_all", error: { code: result.error } }

    quests.push(result.value)
  }

  return {
    ok: true,
    operation: "quests_get_all",
    value: quests
  }
}

type NotesOrderByFields = GenericOrderByFields | "questId"
export function getNotes(
  page: number = 0,
  pageSize: number = DEFAULT_PAGE_SIZE,
  order: {
    sort: "asc" | "desc"
    field: NotesOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  }
): OperationResult<Note[]> {
  const q = safeQuery(() =>
    db
      .select()
      .from(notesTable)
      .orderBy(order.sort === "asc" ? asc(notesTable[order.field]) : desc(notesTable[order.field]))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all()
  )
  if (!q.ok) return { ok: false, operation: "notes_get_all", error: q.error }

  const selectedRows = q.value

  const notes: Note[] = []
  for (const row of selectedRows) {
    const result = mapNoteDBToDomain(row)
    if (!result.ok) return { ok: false, operation: "notes_get_all", error: { code: result.error } }

    notes.push(result.value)
  }

  return {
    ok: true,
    operation: "notes_get_all",
    value: notes
  }
}

type ProgressOrderByFields = GenericOrderByFields | "questId"
export function getProgresses(
  page: number = 0,
  pageSize: number = DEFAULT_PAGE_SIZE,
  order: {
    sort: "asc" | "desc"
    field: ProgressOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  }
): OperationResult<Progress[]> {
  const q = safeQuery(() =>
    db
      .select()
      .from(progressTable)
      .orderBy(order.sort === "asc" ? asc(progressTable[order.field]) : desc(progressTable[order.field]))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all()
  )
  if (!q.ok) return { ok: false, operation: "progresses_get_all", error: q.error }

  const selectedRows = q.value

  const progresses: Progress[] = []
  for (const row of selectedRows) {
    const result = mapProgressDBToDomain(row)
    if (!result.ok) return { ok: false, operation: "progresses_get_all", error: { code: result.error } }

    progresses.push(result.value)
  }

  return {
    ok: true,
    operation: "progresses_get_all",
    value: progresses
  }
}

export function getQuestById(id: Quest["id"]): OperationResult<Quest | null> {
  const q = safeQuery(() => db.select().from(questsTable).where(eq(questsTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "quest_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "quest_get_by_id", value: null }

  const result = mapQuestDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "quest_get_by_id", error: { code: result.error } }

  return { ok: true, operation: "quest_get_by_id", value: result.value }
}

export function getNoteById(id: Note["id"]): OperationResult<Note | null> {
  const q = safeQuery(() => db.select().from(notesTable).where(eq(notesTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "notes_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "notes_get_by_id", value: null }

  const result = mapNoteDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "notes_get_by_id", error: { code: result.error } }

  return { ok: true, operation: "notes_get_by_id", value: result.value }
}

export function getProgressById(id: Progress["id"]): OperationResult<Progress | null> {
  const q = safeQuery(() => db.select().from(progressTable).where(eq(progressTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "progresses_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "progresses_get_by_id", value: null }

  const result = mapProgressDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "progresses_get_by_id", error: { code: result.error } }

  return { ok: true, operation: "progresses_get_by_id", value: result.value }
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
  if (!q.ok) return { ok: false, operation: "quest_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "quest_insert", error: { code: "FAILED_TO_INSERT" } }

  const result = mapQuestDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "quest_insert", error: { code: result.error } }

  return { ok: true, operation: "quest_insert", value: result.value }
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export function insertNote(note: CreateNoteValue): OperationResult<Note> {
  const q = safeQuery(() => db.insert(notesTable).values(note).returning().get())
  if (!q.ok) return { ok: false, operation: "notes_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "notes_insert", error: { code: "FAILED_TO_INSERT" } }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "notes_insert", error: { code: result.error } }

  return { ok: true, operation: "notes_insert", value: result.value }
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export function insertProgress(progress: CreateProgress): OperationResult<Progress> {
  const q = safeQuery(() => db.insert(progressTable).values(progress).returning().get())
  if (!q.ok) return { ok: false, operation: "progresses_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "progresses_insert", error: { code: "FAILED_TO_INSERT" } }

  const result = mapProgressDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "progresses_insert", error: { code: result.error } }

  return { ok: true, operation: "progresses_insert", value: result.value }
}

type Executer =
  | (BunSQLiteDatabase<Record<string, never>> & {
      $client: Database
    })
  | SQLiteTransaction<"sync", void, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>

export type UpdateQuestValues = RequireAtLeastOne<Pick<Quest, "kind" | "title" | "description" | "status">>
export function updateQuest(id: Quest["id"], values: UpdateQuestValues): OperationResult<Quest> {
  if (Object.values(values).length === 0)
    return { ok: false, operation: "quest_update", error: { code: "NO_FIELDS_TO_UPDATE" } }

  const normalizedValues: Partial<typeof questsTable.$inferInsert> = {}
  if (values.kind) normalizedValues.kind = values.kind
  if (values.title) normalizedValues.title = values.title
  if (values.description) normalizedValues.description = values.description
  if (values.status) {
    normalizedValues.status = values.status

    const t = new Date().toISOString()
    if (values.status === "abandoned") normalizedValues.abandonedAt = t
    if (values.status === "completed") normalizedValues.completedAt = t
    if (values.status === "idle") normalizedValues.idledAt = t
    if (values.status === "paused") normalizedValues.pausedAt = t
    if (values.status === "removed") normalizedValues.removedAt = t
  }

  if (values.status === "removed") {
    // cascade
    let txError: null | DBError = null
    db.transaction((tx) => {
      const qQuest = safeQuery(() =>
        tx.update(questsTable).set(normalizedValues).where(eq(questsTable.id, id)).returning().get()
      )
      if (!qQuest.ok) {
        txError = qQuest.error
        return tx.rollback()
      }

      const insertedQuestRow = qQuest.value
      if (!insertedQuestRow) {
        txError = { code: "FAILED_TO_UPDATE" }
        return tx.rollback()
      }

      const qNotes = safeQuery(() =>
        tx
          .update(notesTable)
          .set({ removedAt: normalizedValues.removedAt })
          .where(eq(notesTable.questId, id))
          .returning()
          .all()
      )

      if (!qNotes.ok) {
        txError = qNotes.error
        return tx.rollback()
      }

      const insertedNoteRows = qNotes.value
      if (!insertedNoteRows) {
        txError = { code: "FAILED_TO_UPDATE" }
        return tx.rollback()
      }

      const qProgress = safeQuery(() =>
        tx
          .update(progressTable)
          .set({ removedAt: normalizedValues.removedAt })
          .where(eq(progressTable.questId, id))
          .returning()
          .all()
      )

      if (!qProgress.ok) {
        txError = qProgress.error
        return tx.rollback()
      }

      const insertedProgressRows = qProgress.value
      if (!insertedProgressRows) {
        txError = { code: "FAILED_TO_UPDATE" }
        return tx.rollback()
      }
    })

    if (txError) return { ok: false, operation: "quest_remove_cascade", error: txError }
  }
  // TODO: restore cascade

  const q = safeQuery(() =>
    db.update(questsTable).set(normalizedValues).where(eq(questsTable.id, id)).returning().get()
  )
  if (!q.ok) return { ok: false, operation: "quest_update", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "quest_update", error: { code: "FAILED_TO_UPDATE" } }

  const result = mapQuestDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "quest_update", error: { code: result.error } }

  return { ok: true, operation: "quest_update", value: result.value }
}

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

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "notes_update", error: { code: "FAILED_TO_UPDATE" } }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "notes_update", error: { code: result.error } }

  return { ok: true, operation: "notes_update", value: result.value }
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

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "progresses_update", error: { code: "FAILED_TO_UPDATE" } }

  const result = mapProgressDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "progresses_update", error: { code: result.error } }

  return { ok: true, operation: "progresses_update", value: result.value }
}

export function wipeAllQuestsTableRows(): OperationResult<Quest["id"][]> {
  const q = safeQuery(() => db.delete(questsTable).returning({ id: questsTable.id }).all())
  if (!q.ok) return { ok: false, operation: "quest_delete_all", error: q.error }

  const deletedRowIDs = q.value
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "quest_delete_all", value: flattenedArray }
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
  if (!q.ok) return { ok: false, operation: "quest_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow) return { ok: false, operation: "quest_delete_by_id", error: { code: "FAILED_TO_DELETE" } }

  return { ok: true, operation: "quest_delete_by_id", value: deletedRow.id }
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
  return updateQuest(id, { status: "active" })
}

export function restoreNote(id: Note["id"]) {
  return updateNote(db, id, { removedAt: null })
}

export function restoreProgress(id: Progress["id"]) {
  return updateProgress(db, id, { removedAt: null })
}
