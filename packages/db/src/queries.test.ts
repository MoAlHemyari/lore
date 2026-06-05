import { beforeAll, describe, expect, test } from "bun:test"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { DRIZZLE_OUT } from "./constants"
import {
  deleteNoteById,
  deleteProgressById,
  deleteQuestById,
  getNotes,
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
      const result = updateNote(noteId, {
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
      const result = updateProgress(progressId, {
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
})
