import { asc, desc, eq } from "drizzle-orm"
import type { SelectedFields } from "drizzle-orm/sqlite-core"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"
import type { Note, Progress, Quest } from "@lore/core"

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
type InsertQuest = typeof questsTable.$inferInsert
export async function insertQuest(quest: InsertQuest) {
  const [insertedQuest] = await db.insert(questsTable).values(quest).returning()

  return insertedQuest
}

type InsertNote = typeof notesTable.$inferInsert
export async function insertNote(note: InsertNote) {
  const [insertedNote] = await db.insert(notesTable).values(note).returning()

  return insertedNote
}

type InsertProgress = typeof progressTable.$inferInsert
export async function insertProgress(progress: InsertProgress) {
  const [insertedProgress] = await db.insert(progressTable).values(progress).returning()

  return insertedProgress
}

type UpdateQuest = Partial<InsertQuest>
export async function updateQuest(id: InsertQuest["id"], values: Omit<UpdateQuest, "id">) {
  const [updatedFields] = await db.update(questsTable).set(values).where(eq(questsTable.id, id)).returning()

  return updatedFields
}

type UpdateNote = Partial<InsertNote>
export async function updateNote(id: InsertNote["id"], values: Omit<UpdateNote, "id">) {
  const [updatedFields] = await db.update(notesTable).set(values).where(eq(notesTable.id, id)).returning()

  return updatedFields
}

type UpdateProgress = Partial<InsertProgress>
export async function updateProgress(id: InsertProgress["id"], values: Omit<UpdateProgress, "id">) {
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
