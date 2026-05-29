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
export async function getQuests(
  order: {
    sort: "asc" | "desc"
    field: QuestOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): Promise<OperationResult<Quest[]>> {
  const rows = await db
    .select()
    .from(questsTable)
    .orderBy(order.sort === "asc" ? asc(questsTable[order.field]) : desc(questsTable[order.field]))
    .limit(limit)
    .offset(offset)

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
export async function getNotes(
  order: {
    sort: "asc" | "desc"
    field: NotesOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): Promise<OperationResult<Note[]>> {
  const rows = await db
    .select()
    .from(notesTable)
    .orderBy(order.sort === "asc" ? asc(notesTable[order.field]) : desc(notesTable[order.field]))
    .limit(limit)
    .offset(offset)

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
export async function getProgresses(
  order: {
    sort: "asc" | "desc"
    field: ProgressOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
): Promise<OperationResult<Progress[]>> {
  const rows = await db
    .select()
    .from(progressTable)
    .orderBy(order.sort === "asc" ? asc(progressTable[order.field]) : desc(progressTable[order.field]))
    .limit(limit)
    .offset(offset)

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

export async function getQuestById(id: Quest["id"]): Promise<OperationResult<Quest | null>> {
  const [selected] = await db.select().from(questsTable).where(eq(questsTable.id, id))
  if (!selected) return { ok: true, operation: "quest_get_by_id", value: null }

  const result = mapQuestDBToDomain(selected)
  if (!result.ok) return { ok: false, operation: "quest_get_by_id", error: result.error }

  return { ok: true, operation: "quest_get_by_id", value: result.value }
}

export async function getNoteById(id: Note["id"]): Promise<OperationResult<Note | null>> {
  const [selected] = await db.select().from(notesTable).where(eq(notesTable.id, id))
  if (!selected) return { ok: true, operation: "notes_get_by_id", value: null }

  const result = mapNoteDBToDomain(selected)
  if (!result.ok) return { ok: false, operation: "notes_get_by_id", error: result.error }

  return { ok: true, operation: "notes_get_by_id", value: result.value }
}

export async function getProgressById(id: Progress["id"]): Promise<OperationResult<Note | null>> {
  const [selected] = await db.select().from(progressTable).where(eq(progressTable.id, id))
  if (!selected) return { ok: true, operation: "progresses_get_by_id", value: null }

  const result = mapProgressDBToDomain(selected)
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
export async function insertQuest(values: CreateQuestValues): Promise<OperationResult<Quest>> {
  const [insertedQuest] = await db.insert(questsTable).values(values).returning()
  if (!insertedQuest) return { ok: false, operation: "quest_insert", error: "FAILED_TO_INSERT" }

  const result = mapQuestDBToDomain(insertedQuest)
  if (!result.ok) return { ok: false, operation: "quest_insert", error: result.error }

  return { ok: true, operation: "quest_insert", value: result.value }
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export async function insertNote(note: CreateNoteValue): Promise<OperationResult<Note>> {
  const [insertedNote] = await db.insert(notesTable).values(note).returning()
  if (!insertedNote) return { ok: false, operation: "notes_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedNote)
  if (!result.ok) return { ok: false, operation: "notes_insert", error: result.error }

  return { ok: true, operation: "notes_insert", value: result.value }
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export async function insertProgress(progress: CreateProgress) {
  const [insertedProgress] = await db.insert(progressTable).values(progress).returning()
  if (!insertedProgress) return { ok: false, operation: "progresses_insert", error: "FAILED_TO_INSERT" }

  const result = mapNoteDBToDomain(insertedProgress)
  if (!result.ok) return { ok: false, operation: "progresses_insert", error: result.error }

  return { ok: true, operation: "progress_insert", value: result.value }
}

// update:
export type UpdateQuestValues = Partial<Pick<Quest, "kind" | "title" | "description" | "status">>
export async function updateQuest(
  id: Quest["id"],
  values: UpdateQuestValues
): Promise<OperationResult<Quest>> {
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

  const [updatedRow] = await db.update(questsTable).set(u).where(eq(questsTable.id, id)).returning()
  if (!updatedRow) return { ok: false, operation: "quest_update", error: "FAILED_TO_UPDATE" }

  const result = mapQuestDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "quest_update", error: result.error }

  return { ok: true, operation: "quest_update", value: result.value }
}

export type UpdateNoteValues = Pick<Note, "text">
export async function updateNote(id: Note["id"], values: UpdateNoteValues): Promise<OperationResult<Note>> {
  const [updatedRow] = await db.update(notesTable).set(values).where(eq(notesTable.id, id)).returning()
  if (!updatedRow) return { ok: false, operation: "notes_update", error: "FAILED_TO_UPDATE" }

  const result = mapNoteDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "notes_update", error: result.error }

  return { ok: true, operation: "notes_update", value: result.value }
}

export type UpdateProgressValues = Pick<Progress, "text">
export async function updateProgress(
  id: Progress["id"],
  values: UpdateProgressValues
): Promise<OperationResult<Progress>> {
  const [updatedRow] = await db.update(progressTable).set(values).where(eq(progressTable.id, id)).returning()
  if (!updatedRow) return { ok: false, operation: "progresses_update", error: "FAILED_TO_UPDATE" }

  const result = mapProgressDBToDomain(updatedRow)
  if (!result.ok) return { ok: false, operation: "progresses_update", error: result.error }

  return { ok: true, operation: "progresses_update", value: result.value }
}

export async function wipeAllQuestsTableRows(): Promise<OperationResult<Quest["id"][]>> {
  const deletedRowIDs = await db.delete(questsTable).returning({ id: questsTable.id })
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "quest_delete_all", value: flattenedArray }
}

export async function wipeAllNotesTableRows(): Promise<OperationResult<Note["id"][]>> {
  const deletedRowIDs = await db.delete(notesTable).returning({ id: notesTable.id })
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "notes_delete_all", value: flattenedArray }
}

export async function wipeAllProgressTableRows(): Promise<OperationResult<Progress["id"][]>> {
  const deletedRowIDs = await db.delete(progressTable).returning({ id: progressTable.id })
  const flattenedArray = deletedRowIDs.map((obj) => obj.id)

  return { ok: true, operation: "progresses_delete_all", value: flattenedArray }
}

export async function deleteQuestById(id: Quest["id"]): Promise<OperationResult<Quest["id"]>> {
  const [deletedRowId] = await db
    .delete(questsTable)
    .where(eq(questsTable.id, id))
    .returning({ id: questsTable.id })

  if (!deletedRowId) return { ok: false, operation: "quest_delete_by_id", error: "FAILED_TO_DELETE" }
  return { ok: true, operation: "quest_delete_by_id", value: deletedRowId.id }
}

export async function deleteNoteById(id: Note["id"]): Promise<OperationResult<Note["id"]>> {
  const [deletedRowId] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, id))
    .returning({ id: notesTable.id })

  if (!deletedRowId) return { ok: false, operation: "notes_delete_by_id", error: "FAILED_TO_DELETE" }
  return { ok: true, operation: "notes_delete_by_id", value: deletedRowId.id }
}

export async function deleteProgressById(id: Progress["id"]): Promise<OperationResult<Progress["id"]>> {
  const [deletedRowId] = await db
    .delete(progressTable)
    .where(eq(progressTable.id, id))
    .returning({ id: notesTable.id })

  if (!deletedRowId) return { ok: false, operation: "progresses_delete_by_id", error: "FAILED_TO_DELETE" }
  return { ok: true, operation: "progresses_delete_by_id", value: deletedRowId.id }
}
