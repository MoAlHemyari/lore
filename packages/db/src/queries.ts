import { asc, desc, eq, type InferSelectModel } from "drizzle-orm"
import { type Note, type Progress, type Quest } from "@lore/core"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"
import type { ErrorCode } from "./errors"
import { mapNoteDBToDomain, mapProgressDBToDomain, mapQuestDBToDomain } from "./parsers"
import { safeQuery } from "./helpers"

const operations = [
  // quest operations
  "quests_get_all",
  "quest_get_by_id",
  "quest_insert",
  "quest_update",
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
      error: ErrorCode | Error
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
    if (!result.ok) return { ok: false, operation: "quests_get_all", error: result.error }

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
    if (!result.ok) return { ok: false, operation: "notes_get_all", error: result.error }

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
    if (!result.ok) return { ok: false, operation: "progresses_get_all", error: result.error }

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
  if (!result.ok) return { ok: false, operation: "quest_get_by_id", error: result.error }

  return { ok: true, operation: "quest_get_by_id", value: result.value }
}

export function getNoteById(id: Note["id"]): OperationResult<Note | null> {
  const q = safeQuery(() => db.select().from(notesTable).where(eq(notesTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "notes_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "notes_get_by_id", value: null }

  const result = mapNoteDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "notes_get_by_id", error: result.error }

  return { ok: true, operation: "notes_get_by_id", value: result.value }
}

export function getProgressById(id: Progress["id"]): OperationResult<Note | null> {
  const q = safeQuery(() => db.select().from(progressTable).where(eq(progressTable.id, id)).get())
  if (!q.ok) return { ok: false, operation: "progresses_get_by_id", error: q.error }

  const selectedRow = q.value
  if (!selectedRow) return { ok: true, operation: "progresses_get_by_id", value: null }

  const result = mapProgressDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "progresses_get_by_id", error: result.error }

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
  if (!insertedRow) return { ok: false, operation: "quest_insert", error: "FAILED_TO_INSERT" }

  const result = mapQuestDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "quest_insert", error: result.error }

  return { ok: true, operation: "quest_insert", value: result.value }
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export function insertNote(note: CreateNoteValue): OperationResult<Note> {
  const q = safeQuery(() => db.insert(notesTable).values(note).returning().get())
  if (!q.ok) return { ok: false, operation: "notes_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "notes_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "notes_insert", error: result.error }

  return { ok: true, operation: "notes_insert", value: result.value }
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export function insertProgress(progress: CreateProgress) {
  const q = safeQuery(() => db.insert(progressTable).values(progress).returning().get())
  if (!q.ok) return { ok: false, operation: "progress_insert", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "progress_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "progress_insert", error: result.error }

  return { ok: true, operation: "progress_insert", value: result.value }
}

export type UpdateQuestValues = Partial<Pick<Quest, "kind" | "title" | "description" | "status">>
export function updateQuest(id: Quest["id"], values: UpdateQuestValues): OperationResult<Quest> {
  // add the timestamp of new status if changed (to the sqlite table shape on the fly)
  let u: Partial<InferSelectModel<typeof questsTable>> = { ...values }

  if (values.status) {
    const t = new Date().toISOString()
    if (values.status === "abandoned") u.abandonedAt = t
    if (values.status === "completed") u.completedAt = t
    if (values.status === "idle") u.idledAt = t
    if (values.status === "paused") u.pausedAt = t
    if (values.status === "removed") u.removedAt = t
  }

  const q = safeQuery(() => db.update(questsTable).set(u).where(eq(questsTable.id, id)).returning().get())
  if (!q.ok) return { ok: false, operation: "quest_update", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "quest_update", error: "FAILED_TO_UPDATE" }

  const result = mapQuestDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "quest_update", error: result.error }

  return { ok: true, operation: "quest_update", value: result.value }
}

export type UpdateNoteValues = Pick<Note, "text">
export function updateNote(id: Note["id"], values: UpdateNoteValues): OperationResult<Note> {
  const q = safeQuery(() => db.update(notesTable).set(values).where(eq(notesTable.id, id)).returning().get())
  if (!q.ok) return { ok: false, operation: "notes_update", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "notes_update", error: "FAILED_TO_UPDATE" }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "notes_update", error: result.error }

  return { ok: true, operation: "notes_update", value: result.value }
}

export type UpdateProgressValues = Pick<Progress, "text">
export function updateProgress(id: Progress["id"], values: UpdateProgressValues): OperationResult<Progress> {
  const q = safeQuery(() =>
    db.update(progressTable).set(values).where(eq(progressTable.id, id)).returning().get()
  )
  if (!q.ok) return { ok: false, operation: "progresses_update", error: q.error }

  const insertedRow = q.value
  if (!insertedRow) return { ok: false, operation: "progresses_update", error: "FAILED_TO_UPDATE" }

  const result = mapProgressDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "progresses_update", error: result.error }

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
  if (!deletedRow) return { ok: false, operation: "quest_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "quest_delete_by_id", value: deletedRow.id }
}

export function deleteNoteById(id: Note["id"]): OperationResult<Note["id"]> {
  const q = safeQuery(() =>
    db.delete(notesTable).where(eq(notesTable.id, id)).returning({ id: notesTable.id }).get()
  )
  if (!q.ok) return { ok: false, operation: "notes_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow) return { ok: false, operation: "notes_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "notes_delete_by_id", value: deletedRow.id }
}

export function deleteProgressById(id: Progress["id"]): OperationResult<Progress["id"]> {
  const q = safeQuery(() =>
    db.delete(progressTable).where(eq(progressTable.id, id)).returning({ id: notesTable.id }).get()
  )
  if (!q.ok) return { ok: false, operation: "progresses_delete_by_id", error: q.error }

  const deletedRow = q.value
  if (!deletedRow) return { ok: false, operation: "progresses_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "progresses_delete_by_id", value: deletedRow.id }
}
