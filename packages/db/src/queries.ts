import { asc, desc, eq, type InferSelectModel } from "drizzle-orm"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"
import { type Note, type Progress, type Quest } from "@lore/core"
import type { ErrorCode } from "./errors"
import { mapNoteDBToDomain, mapProgressDBToDomain, mapQuestDBToDomain } from "./parsers"

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
      error: ErrorCode
    }

const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 10

type GenericOrderByFields = "createdAt" | "updatedAt"

type QuestOrderByFields = GenericOrderByFields | "kind" | "status"
export function getQuests(
  order: {
    sort: "asc" | "desc"
    field: QuestOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): OperationResult<Quest[]> {
  const rows = db
    .select()
    .from(questsTable)
    .orderBy(order.sort === "asc" ? asc(questsTable[order.field]) : desc(questsTable[order.field]))
    .limit(limit)
    .offset(offset)
    .all()

  const quests: Quest[] = []
  for (const row of rows) {
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
  order: {
    sort: "asc" | "desc"
    field: NotesOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): OperationResult<Note[]> {
  const rows = db
    .select()
    .from(notesTable)
    .orderBy(order.sort === "asc" ? asc(notesTable[order.field]) : desc(notesTable[order.field]))
    .limit(limit)
    .offset(offset)
    .all()

  const notes: Note[] = []
  for (const row of rows) {
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
  order: {
    sort: "asc" | "desc"
    field: ProgressOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): OperationResult<Progress[]> {
  const rows = db
    .select()
    .from(progressTable)
    .orderBy(order.sort === "asc" ? asc(progressTable[order.field]) : desc(progressTable[order.field]))
    .limit(limit)
    .offset(offset)
    .all()

  const progresses: Progress[] = []
  for (const row of rows) {
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
  const selectedRow = db.select().from(questsTable).where(eq(questsTable.id, id)).get()
  if (!selectedRow) return { ok: true, operation: "quest_get_by_id", value: null }

  const result = mapQuestDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "quest_get_by_id", error: result.error }

  return { ok: true, operation: "quest_get_by_id", value: result.value }
}

export function getNoteById(id: Note["id"]): OperationResult<Note | null> {
  const selectedRow = db.select().from(notesTable).where(eq(notesTable.id, id)).get()
  if (!selectedRow) return { ok: true, operation: "notes_get_by_id", value: null }

  const result = mapNoteDBToDomain(selectedRow)
  if (!result.ok) return { ok: false, operation: "notes_get_by_id", error: result.error }

  return { ok: true, operation: "notes_get_by_id", value: result.value }
}

export function getProgressById(id: Progress["id"]): OperationResult<Note | null> {
  const selectedRow = db.select().from(progressTable).where(eq(progressTable.id, id)).get()
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
  const insertedRow = db.insert(questsTable).values(values).returning().get()

  if (!insertedRow) return { ok: false, operation: "quest_insert", error: "FAILED_TO_INSERT" }

  const result = mapQuestDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "quest_insert", error: result.error }

  return { ok: true, operation: "quest_insert", value: result.value }
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export function insertNote(note: CreateNoteValue): OperationResult<Note> {
  const insertedRow = db.insert(notesTable).values(note).returning().get()
  if (!insertedRow) return { ok: false, operation: "notes_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "notes_insert", error: result.error }

  return { ok: true, operation: "notes_insert", value: result.value }
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export function insertProgress(progress: CreateProgress) {
  const insertedRow = db.insert(progressTable).values(progress).returning().get()
  if (!insertedRow) return { ok: false, operation: "progresses_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedRow)
  if (!result.ok) return { ok: false, operation: "progresses_insert", error: result.error }

  return { ok: true, operation: "progress_insert", value: result.value }
}

// update:
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

  const updatedRow = db.update(questsTable).set(u).where(eq(questsTable.id, id)).returning().get()
  if (!updatedRow) return { ok: false, operation: "quest_update", error: "FAILED_TO_UPDATE" }

  const result = mapQuestDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "quest_update", error: result.error }

  return { ok: true, operation: "quest_update", value: result.value }
}

export type UpdateNoteValues = Pick<Note, "text">
export function updateNote(id: Note["id"], values: UpdateNoteValues): OperationResult<Note> {
  const updatedRow = db.update(notesTable).set(values).where(eq(notesTable.id, id)).returning().get()
  if (!updatedRow) return { ok: false, operation: "notes_update", error: "FAILED_TO_UPDATE" }

  const result = mapNoteDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "notes_update", error: result.error }

  return { ok: true, operation: "notes_update", value: result.value }
}

export type UpdateProgressValues = Pick<Progress, "text">
export function updateProgress(id: Progress["id"], values: UpdateProgressValues): OperationResult<Progress> {
  const updatedRow = db.update(progressTable).set(values).where(eq(progressTable.id, id)).returning().get()
  if (!updatedRow) return { ok: false, operation: "progresses_update", error: "FAILED_TO_UPDATE" }

  const result = mapProgressDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "progresses_update", error: result.error }

  return { ok: true, operation: "progresses_update", value: result.value }
}

export function wipeAllQuestsTableRows(): OperationResult<Quest["id"][]> {
  const deletedRowIDs = db.delete(questsTable).returning({ id: questsTable.id }).all()
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "quest_delete_all", value: flattenedArray }
}

export function wipeAllNotesTableRows(): OperationResult<Note["id"][]> {
  const deletedRowIDs = db.delete(notesTable).returning({ id: notesTable.id }).all()
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "notes_delete_all", value: flattenedArray }
}

export function wipeAllProgressTableRows(): OperationResult<Progress["id"][]> {
  const deletedRowIDs = db.delete(progressTable).returning({ id: progressTable.id }).all()
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "progresses_delete_all", value: flattenedArray }
}

export function deleteQuestById(id: Quest["id"]): OperationResult<Quest["id"]> {
  const deletedRowId = db
    .delete(questsTable)
    .where(eq(questsTable.id, id))
    .returning({ id: questsTable.id })
    .get()
  if (!deletedRowId) return { ok: false, operation: "quest_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "quest_delete_by_id", value: deletedRowId.id }
}

export function deleteNoteById(id: Note["id"]): OperationResult<Note["id"]> {
  const deletedRowId = db
    .delete(notesTable)
    .where(eq(notesTable.id, id))
    .returning({ id: notesTable.id })
    .get()
  if (!deletedRowId) return { ok: false, operation: "notes_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "notes_delete_by_id", value: deletedRowId.id }
}

export function deleteProgressById(id: Progress["id"]): OperationResult<Progress["id"]> {
  const deletedRowId = db
    .delete(progressTable)
    .where(eq(progressTable.id, id))
    .returning({ id: notesTable.id })
    .get()
  if (!deletedRowId) return { ok: false, operation: "progresses_delete_by_id", error: "FAILED_TO_DELETE" }

  return { ok: true, operation: "progresses_delete_by_id", value: deletedRowId.id }
}
