import { eq } from "drizzle-orm"
import { quests as questsTable, notes as notesTable, progress as progressTable } from "./schema"
import { db } from "./db"

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
