import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { DRIZZLE_OUT } from "./constants"
import {
  deleteNoteById,
  deleteProgressById,
  deleteQuestById,
  getNoteById,
  getNotes,
  getProgressById,
  getProgresses,
  getQuestById,
  getQuests,
  insertNote,
  insertProgress,
  insertQuest,
  removeNote,
  removeProgress,
  removeQuest,
  restoreNote,
  restoreProgress,
  restoreQuest,
  updateNote,
  updateProgress,
  updateQuest,
  wipeAllNotesTableRows,
  wipeAllProgressTableRows,
  wipeAllQuestsTableRows
} from "./queries"
import { db } from "./db"
import type { Note, Progress, Quest } from "@lore/core"

describe("lifecycles", () => {
  beforeAll(() => {
    migrate(db, { migrationsFolder: DRIZZLE_OUT })
  })
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  describe("quest", () => {
    let questId: Quest["id"]

    test("insert", () => {
      const result = insertQuest({
        title: "first quest",
        description: "",
        kind: "main",
        status: "active"
      })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.title).toBe("first quest")
      expect(result.value.description).toBe("")
      expect(result.value.kind).toBe("main")
      expect(result.value.status).toBe("active")
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.idledAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
      expect(result.value.updatedAt).toBeValidDate()
      expect(result.value.createdAt).toBeValidDate()

      // assign to the higher lvl var to be used in other tests
      questId = result.value.id
    })

    test("get all", () => {
      const result = getQuests()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()

      if (result.value.length > 0) expect(uuidPattern.test(result.value[0]!.id)).toBeTrue()
      else console.log("There are no quests in the table.")
    })

    test("get by id", () => {
      const result = getQuestById(questId)
      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).not.toBeNull()
      expect(uuidPattern.test(result.value!.id)).toBeTrue()
      expect(result.value!.title).toBeString()
      expect(result.value!.status).toBe("active")
    })

    test("update", () => {
      const result = updateQuest(questId, {
        title: "New updated title",
        description: "New added description",
        kind: "side"
      })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.title).toBe("New updated title")
      expect(result.value.description).toBe("New added description")
      expect(result.value.kind).toBe("side")
      expect(result.value.status).toBe("active")
    })

    test("pause", () => {
      const result = updateQuest(questId, { status: "paused" })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.status).toBe("paused")
      expect(result.value.pausedAt).toBeValidDate()
    })

    test("abandon", () => {
      const result = updateQuest(questId, { status: "abandoned" })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.status).toBe("abandoned")
      expect(result.value.abandonedAt).toBeValidDate()
    })

    test("complete", () => {
      const result = updateQuest(questId, { status: "completed" })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.status).toBe("completed")
      expect(result.value.completedAt).toBeValidDate()
    })

    test("remove", () => {
      const result = removeQuest(questId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.status).toBe("removed")
      expect(result.value.removedAt).toBeValidDate()
    })

    test("reactivate/restore", () => {
      const result = restoreQuest(questId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.status).toBe("active")
    })

    test("delete", () => {
      const result = deleteQuestById(questId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBe(questId)
    })
    test("delete all", () => {
      // insert mutliple quests before delete them all
      insertQuest({
        title: "second quest",
        description: "",
        kind: "main",
        status: "active"
      })

      insertQuest({
        title: "third quest",
        description: "",
        kind: "main",
        status: "active"
      })

      insertQuest({
        title: "forth quest",
        description: "",
        kind: "main",
        status: "active"
      })

      const result = wipeAllQuestsTableRows()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()
    })
  })

  describe("note", () => {
    let noteId: Note["id"]
    let noteQuestId: Quest["id"]

    const quest = insertQuest({
      title: "note quest",
      description: "",
      kind: "main",
      status: "active"
    })

    if (!quest.ok) throw new Error("Expected note quest insert to succeed")

    noteQuestId = quest.value.id

    test("insert", () => {
      const result = insertNote({
        text: "first note",
        questId: noteQuestId
      })

      if (!result.ok) throw new Error(result.error.code)

      expect(uuidPattern.test(result.value.id)).toBeTrue()
      expect(result.value.text).toBe("first note")
      expect(result.value.questId).toBe(noteQuestId)
      expect(result.value.removedAt).toBeNull()

      noteId = result.value.id
    })

    test("update", () => {
      const result = updateNote(db, noteId, {
        text: "updated note title"
      })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.id).toBe(noteId)
      expect(result.value.text).toBe("updated note title")
      expect(result.value.questId).toBe(noteQuestId)
    })

    test("remove", () => {
      const result = removeNote(noteId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.removedAt).toBeValidDate()
    })

    test("restore", () => {
      const result = restoreNote(noteId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.removedAt).toBeNull()
    })

    test("delete", () => {
      const result = deleteNoteById(noteId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBe(noteId)
    })

    test("get all", () => {
      insertNote({
        text: "second note",
        questId: noteQuestId
      })

      insertNote({
        text: "third note",
        questId: noteQuestId
      })

      const result = getNotes()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()
      expect(result.value.length).toBeGreaterThan(0)
      expect(uuidPattern.test(result.value[0]!.id)).toBeTrue()
      expect(result.value[0]!.text).toBeString()
      expect(result.value[0]!.updatedAt).toBeValidDate()
      expect(result.value[0]!.createdAt).toBeValidDate()
    })

    test("delete all", () => {
      const result = wipeAllNotesTableRows()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()
    })
  })

  describe("progress", () => {
    let progressId: Progress["id"]
    let progressQuestId: Quest["id"]

    const quest = insertQuest({
      title: "progress quest",
      description: "",
      kind: "main",
      status: "active"
    })

    if (!quest.ok) throw new Error("Expected progress quest insert to succeed")

    progressQuestId = quest.value.id

    test("insert", () => {
      const result = insertProgress({
        text: "first progress",
        questId: progressQuestId
      })

      expect(result.ok).toBe(true)
      if (!result.ok) throw new Error(result.error.code)

      progressId = result.value.id

      expect(uuidPattern.test(result.value.id)).toBeTrue()
      expect(result.value.text).toBe("first progress")
      expect(result.value.questId).toBe(progressQuestId)
      expect(result.value.removedAt).toBeNull()
      expect(result.value.updatedAt).toBeValidDate()
      expect(result.value.createdAt).toBeValidDate()
    })

    test("update", () => {
      const result = updateProgress(db, progressId, {
        text: "updated progress"
      })

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.id).toBe(progressId)
      expect(result.value.text).toBe("updated progress")
      expect(result.value.questId).toBe(progressQuestId)
    })

    test("remove", () => {
      const result = removeProgress(progressId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.removedAt).toBeValidDate()
    })

    test("restore", () => {
      const result = restoreProgress(progressId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value.removedAt).toBeNull()
    })

    test("delete", () => {
      const result = deleteProgressById(progressId)

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBe(progressId)
    })

    test("get all", () => {
      const progress1 = insertProgress({
        text: "second progress",
        questId: progressQuestId
      })
      if (!progress1.ok) throw new Error(progress1.error.code)

      const progress2 = insertProgress({
        text: "third progress",
        questId: progressQuestId
      })
      if (!progress2.ok) throw new Error(progress2.error.code)

      const result = getProgresses()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()
      expect(result.value.length).toBeGreaterThan(0)
      expect(uuidPattern.test(result.value[0]!.id)).toBeTrue()
      expect(result.value[0]!.text).toBeString()
      expect(result.value[0]!.updatedAt).toBeValidDate()
      expect(result.value[0]!.createdAt).toBeValidDate()
    })

    test("delete all", () => {
      const result = wipeAllProgressTableRows()

      if (!result.ok) throw new Error(result.error.code)

      expect(result.value).toBeArray()
    })
  })

  describe("complex", () => {
    let quest1: any,
      quest2: any,
      note1: any,
      note2: any,
      note3: any,
      note4: any,
      progress1: any,
      progress2: any,
      progress3: any,
      progress4: any

    beforeEach(() => {
      quest1 = insertQuest({
        title: "quest",
        description: "",
        kind: "main",
        status: "active"
      })
      if (!quest1.ok) throw new Error(quest1.error.code)

      quest2 = insertQuest({
        title: "quest",
        description: "",
        kind: "main",
        status: "active"
      })
      if (!quest2.ok) throw new Error(quest2.error.code)

      note1 = insertNote({ text: "note 1", questId: quest1.value.id })
      if (!note1.ok) throw new Error(note1.error.code)

      note2 = insertNote({ text: "note 2" })
      if (!note2.ok) throw new Error(note2.error.code)

      note3 = insertNote({ text: "note 3", questId: quest2.value.id })
      if (!note3.ok) throw new Error(note3.error.code)

      note4 = insertNote({ text: "note 4" })
      if (!note4.ok) throw new Error(note4.error.code)

      progress1 = insertProgress({ text: "progress 1", questId: quest1.value.id })
      if (!progress1.ok) throw new Error(progress1.error.code)

      progress2 = insertProgress({ text: "progress 2", questId: quest2.value.id })
      if (!progress2.ok) throw new Error(progress2.error.code)

      progress3 = insertProgress({ text: "progress 3", questId: quest2.value.id })
      if (!progress3.ok) throw new Error(progress3.error.code)

      progress4 = insertProgress({ text: "progress 4", questId: quest1.value.id })
      if (!progress4.ok) throw new Error(progress4.error.code)

      const removedQuest = removeQuest(quest1.value.id)
      if (!removedQuest.ok) throw new Error(removedQuest.error.code)

      expect(removedQuest.value.status).toBe("removed")
      expect(removedQuest.value.removedAt).toBeValidDate()
    })

    test("cascade quest remove", () => {
      const note1_1 = getNoteById(note1.value.id)
      console.log(note1_1)
      if (!note1_1.ok) throw new Error(note1_1.error.code)
      if (!note1_1.value) throw new Error("Couldn't be found")

      const note2_1 = getNoteById(note2.value.id)
      if (!note2_1.ok) throw new Error(note2_1.error.code)
      if (!note2_1.value) throw new Error("Couldn't be found")

      const note3_1 = getNoteById(note3.value.id)
      if (!note3_1.ok) throw new Error(note3_1.error.code)
      if (!note3_1.value) throw new Error("Couldn't be found")

      const note4_1 = getNoteById(note4.value.id)
      if (!note4_1.ok) throw new Error(note4_1.error.code)
      if (!note4_1.value) throw new Error("Couldn't be found")

      const progress1_1 = getProgressById(progress1.value.id)
      if (!progress1_1.ok) throw new Error(progress1_1.error.code)
      if (!progress1_1.value) throw new Error("Couldn't be found")

      const progress2_1 = getProgressById(progress2.value.id)
      if (!progress2_1.ok) throw new Error(progress2_1.error.code)
      if (!progress2_1.value) throw new Error("Couldn't be found")

      const progress3_1 = getProgressById(progress3.value.id)
      if (!progress3_1.ok) throw new Error(progress3_1.error.code)
      if (!progress3_1.value) throw new Error("Couldn't be found")

      const progress4_1 = getProgressById(progress4.value.id)
      if (!progress4_1.ok) throw new Error(progress4_1.error.code)
      if (!progress4_1.value) throw new Error("Couldn't be found")

      expect(note1_1.value.removedAt).toBeValidDate()
      expect(note2_1.value.removedAt).toBeNull()
      expect(note3_1.value.removedAt).toBeNull()
      expect(note4_1.value.removedAt).toBeNull()

      expect(progress1_1.value.removedAt).toBeValidDate()
      expect(progress2_1.value.removedAt).toBeNull()
      expect(progress3_1.value.removedAt).toBeNull()
      expect(progress4_1.value.removedAt).toBeValidDate()
    })

    test("cascade quest restore", () => {
      const restoredQuest = restoreQuest(quest1.value.id)
      if (!restoredQuest.ok) throw new Error(restoredQuest.error.code)

      expect(restoredQuest.value.status).toBe("active")

      const note1_1 = getNoteById(note1.value.id)
      if (!note1_1.ok) throw new Error(note1_1.error.code)
      if (!note1_1.value) throw new Error("Couldn't be found")

      const note2_1 = getNoteById(note2.value.id)
      if (!note2_1.ok) throw new Error(note2_1.error.code)
      if (!note2_1.value) throw new Error("Couldn't be found")

      const note3_1 = getNoteById(note3.value.id)
      if (!note3_1.ok) throw new Error(note3_1.error.code)
      if (!note3_1.value) throw new Error("Couldn't be found")

      const note4_1 = getNoteById(note4.value.id)
      if (!note4_1.ok) throw new Error(note4_1.error.code)
      if (!note4_1.value) throw new Error("Couldn't be found")

      const progress1_1 = getProgressById(progress1.value.id)
      if (!progress1_1.ok) throw new Error(progress1_1.error.code)
      if (!progress1_1.value) throw new Error("Couldn't be found")

      const progress2_1 = getProgressById(progress2.value.id)
      if (!progress2_1.ok) throw new Error(progress2_1.error.code)
      if (!progress2_1.value) throw new Error("Couldn't be found")

      const progress3_1 = getProgressById(progress3.value.id)
      if (!progress3_1.ok) throw new Error(progress3_1.error.code)
      if (!progress3_1.value) throw new Error("Couldn't be found")

      const progress4_1 = getProgressById(progress4.value.id)
      if (!progress4_1.ok) throw new Error(progress4_1.error.code)
      if (!progress4_1.value) throw new Error("Couldn't be found")

      expect(note1_1.value.removedAt).toBeNull()
      expect(note2_1.value.removedAt).toBeNull()
      expect(note3_1.value.removedAt).toBeNull()
      expect(note4_1.value.removedAt).toBeNull()

      expect(progress1_1.value.removedAt).toBeNull()
      expect(progress2_1.value.removedAt).toBeNull()
      expect(progress3_1.value.removedAt).toBeNull()
      expect(progress4_1.value.removedAt).toBeNull()
    })
  })
})
