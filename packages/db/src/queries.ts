import { asc, desc, eq } from "drizzle-orm"
import type { SelectedFields } from "drizzle-orm/sqlite-core"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"
import { questKinds, questLifecycleStatuses, type Note, type Progress, type Quest } from "@lore/core"

// read functions
export async function getAllQuests() {
  return db.select().from(questsTable)
}

export async function getAllNotes() {
  return db.select().from(notesTable)
}

export async function getAllProgresses() {
  return db.select().from(progressTable)
}

const DEFAULT_OFFSET = 0
const DEFAULT_LIMIT = 10

type GenericOrderByFields = "createdAt" | "updatedAt"

type QuestOrderByFields = GenericOrderByFields | "kind" | "status"
export async function getQuests(
  selection: SelectedFields,
  order: {
    sort: "asc" | "desc"
    field: QuestOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
) {
  return db
    .select(selection)
    .from(questsTable)
    .orderBy(order.sort === "asc" ? asc(questsTable[order.field]) : desc(questsTable[order.field]))
    .limit(limit)
    .offset(offset)
}

type NotesOrderByFields = GenericOrderByFields | "questId"
export async function getNotes(
  selection: SelectedFields,
  order: {
    sort: "asc" | "desc"
    field: NotesOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
) {
  return db
    .select(selection)
    .from(notesTable)
    .orderBy(order.sort === "asc" ? asc(notesTable[order.field]) : desc(notesTable[order.field]))
    .limit(limit)
    .offset(offset)
}

type ProgressOrderByFields = GenericOrderByFields | "questId"
export async function getProgress(
  selection: SelectedFields,
  order: {
    sort: "asc" | "desc"
    field: ProgressOrderByFields
  } = {
    sort: "desc",
    field: "createdAt"
  },
  limit: number = DEFAULT_LIMIT,
  offset: number = DEFAULT_OFFSET
) {
  return db
    .select(selection)
    .from(progressTable)
    .orderBy(order.sort === "asc" ? asc(progressTable[order.field]) : desc(progressTable[order.field]))
    .limit(limit)
    .offset(offset)
}

export async function getQuestById(id: Quest["id"]) {
  const [selected] = await db.select().from(questsTable).where(eq(questsTable.id, id))

  if (selected) return selected

  return null
}

export async function getNoteById(id: Note["id"]) {
  const [selected] = await db.select().from(notesTable).where(eq(notesTable.id, id))

  if (selected) return selected

  return null
}

export async function getProgressById(id: Progress["id"]) {
  const [selected] = await db.select().from(progressTable).where(eq(progressTable.id, id))

  if (selected) return selected

  return null
}

// mutations
export type CreateQuestValues = {
  title: Quest["title"]
  kind?: Quest["kind"]
  description?: Quest["description"]
  status?: Quest["status"]
}
export async function insertQuest(quest: CreateQuestValues) {
  const updateValues: typeof questsTable.$inferInsert = {
    ...quest,
    kind: quest.kind ?? questKinds.MAIN,
    status: quest.status ?? questLifecycleStatuses.ACTIVE
  }

  const [insertedQuest] = await db.insert(questsTable).values(updateValues).returning()

  return insertedQuest
}

export type CreateNoteValue = Pick<typeof notesTable.$inferInsert, "text" | "questId">
export async function insertNote(note: CreateNoteValue) {
  const [insertedNote] = await db.insert(notesTable).values(note).returning()

  return insertedNote
}

export type CreateProgress = Pick<typeof progressTable.$inferInsert, "text" | "questId">
export async function insertProgress(progress: CreateProgress) {
  const [insertedProgress] = await db.insert(progressTable).values(progress).returning()

  return insertedProgress
}

export type UpdateQuestValues = Pick<Quest, "kind" | "title" | "description" | "status">
export async function updateQuest(id: Quest["id"], values: UpdateQuestValues) {
  if (id === undefined) return undefined

  // update status change timestamp
  const updateValues = {
    ...values,

    ...(values.status === "paused" && { pausedAt: new Date().toISOString() }),
    ...(values.status === "idle" && { idledAt: new Date().toISOString() }),
    ...(values.status === "abandoned" && { abandonedAt: new Date().toISOString() }),
    ...(values.status === "completed" && { completedAt: new Date().toISOString() }),
    ...(values.status === "removed" && { removedAt: new Date().toISOString() })
  }

  const [updatedFields] = await db
    .update(questsTable)
    .set(updateValues)
    .where(eq(questsTable.id, id))
    .returning()

  return updatedFields
}

export type UpdateNoteValues = Pick<Note, "text">
export async function updateNote(id: Note["id"], values: UpdateNoteValues) {
  if (id === undefined) return undefined

  const [updatedFields] = await db.update(notesTable).set(values).where(eq(notesTable.id, id)).returning()

  return updatedFields
}

export type UpdateProgressValues = Pick<Progress, "text">
export async function updateProgress(id: Progress["id"], values: UpdateProgressValues) {
  if (id === undefined) return undefined

  const [updatedFields] = await db
    .update(progressTable)
    .set(values)
    .where(eq(progressTable.id, id))
    .returning()

  return updatedFields
}

type DeletedRow<ID> = { deletedId: ID }
type DeleteResult<ID> = Promise<DeletedRow<ID> | null>
type DeleteManyResult<ID> = Promise<DeletedRow<ID>[]>

export async function wipeAllQuestsTableRows(): DeleteManyResult<Quest["id"]> {
  return db.delete(questsTable).returning({ deletedId: questsTable.id })
}

export async function wipeAllNotesTableRows(): DeleteManyResult<Note["id"]> {
  return db.delete(notesTable).returning({ deletedId: notesTable.id })
}

export async function wipeAllProgressTableRows(): DeleteManyResult<Progress["id"]> {
  return db.delete(progressTable).returning({ deletedId: progressTable.id })
}

export async function deleteQuestById(id: Quest["id"]): DeleteResult<Quest["id"]> {
  const [deletedId] = await db
    .delete(questsTable)
    .where(eq(questsTable.id, id))
    .returning({ deletedId: questsTable.id })

  if (deletedId) return deletedId

  return null
}

export async function deleteNoteById(id: Note["id"]): DeleteResult<Note["id"]> {
  const [deletedId] = await db
    .delete(notesTable)
    .where(eq(notesTable.id, id))
    .returning({ deletedId: notesTable.id })

  if (deletedId) return deletedId

  return null
}

export async function deleteProgressById(id: Progress["id"]): DeleteResult<Progress["id"]> {
  const [deletedId] = await db
    .delete(progressTable)
    .where(eq(progressTable.id, id))
    .returning({ deletedId: progressTable.id })

  if (deletedId) return deletedId

  return null
}
