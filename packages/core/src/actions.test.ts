import { describe, expect, test } from "bun:test"
import type { Note, Progress, Quest } from "./entities"
import {
  updateQuestTitle,
  updateNote,
  updateProgress,
  createQuest,
  updateQuestDescription,
  markQuestPaused,
  markQuestIdle,
  markQuestAbandoned,
  markQuestCompleted,
  markQuestRemoved,
  markQuestActive,
  createNote,
  markNoteRemoved,
  markNoteActive,
  createProgress,
  markProgressRemoved,
  markProgressActive
} from "./actions"

const createTestQuest = (): Quest => ({
  id: crypto.randomUUID(),
  title: "Initial API contract draft",
  description: "Document the endpoint behavior and edge cases",
  kind: "main",
  status: "active",
  notes: [],
  progress: [],
  pausedAt: null,
  idledAt: null,
  abandonedAt: null,
  completedAt: null,
  createdAt: new Date("2026-05-16T00:00:00.000Z"),
  updatedAt: null,
  removedAt: null
})

const createTestNote = (): Note => ({
  id: crypto.randomUUID(),
  questId: crypto.randomUUID(),
  text: "Need to confirm backward compatibility before merging",
  createdAt: new Date("2026-05-16T00:00:00.000Z"),
  updatedAt: null,
  removedAt: null
})

const createTestProgress = (): Progress => ({
  id: crypto.randomUUID(),
  questId: crypto.randomUUID(),
  text: "Implemented the optimistic update flow",
  createdAt: new Date("2026-05-16T00:00:00.000Z"),
  updatedAt: null,
  removedAt: null
})

describe("quest actions", () => {
  describe("createQuest", () => {
    test("creates a quest with untrimmed title value and defaults", () => {
      const questId = crypto.randomUUID()
      const result = createQuest(questId, "  quest name  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_create")

      // ts narrowing
      if (!result.ok) throw new Error("Expected createQuest to succeed")

      // expect(result.value.id).toBe(questId)
      expect(result.value.title).toBe("quest name")
      expect(result.value.kind).toBe("main")
      expect(result.value.status).toBe("active")
      expect(result.value.description).toBe("")
      expect(result.value.notes).toEqual([])
      expect(result.value.progress).toEqual([])
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.idledAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
      expect(result.value.updatedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
      expect(result.value.createdAt).toBeInstanceOf(Date)
    })

    test("creates a quest with explicit title, kind, status, and description", () => {
      const questId = crypto.randomUUID()
      const result = createQuest(questId, "quest title", "side", "paused", "quest description")

      expect(result.ok).toBe(true)

      // ts narrowing
      if (!result.ok) throw new Error("Expected createQuest to succeed")

      // expect(result.value.id).toBe(questId)
      expect(result.value.title).toBe("quest title")
      expect(result.value.kind).toBe("side")
      expect(result.value.status).toBe("paused")
      expect(result.value.description).toBe("quest description")
    })

    test("rejects an invalid id", () => {
      const result = createQuest("invalid-id", "quest title")

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_ID_INVALID"
      })
    })

    test("rejects an empty string title value", () => {
      const result = createQuest(crypto.randomUUID(), "   ")

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_TITLE_REQUIRED"
      })
    })

    test("rejects an invalid kind", () => {
      const result = createQuest(crypto.randomUUID(), "quest title", "epic" as never)

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_KIND_INVALID"
      })
    })

    test("rejects an invalid status", () => {
      const result = createQuest(crypto.randomUUID(), "quest title", "main", "sleeping" as never)

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_STATUS_INVALID"
      })
    })

    test("rejects idle status", () => {
      const result = createQuest(crypto.randomUUID(), "quest title", "main", "idle")

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_STATUS_CANNOT_BE_INITIALIZED_WITH_IDLED"
      })
    })

    test("rejects removed status", () => {
      const result = createQuest(crypto.randomUUID(), "quest title", "main", "removed")

      expect(result).toEqual({
        ok: false,
        action: "quest_create",
        error: "QUEST_STATUS_CANNOT_BE_INITIALIZED_WITH_REMOVED"
      })
    })
  })

  describe("updateQuestTitle", () => {
    test("updates the quest title with untrimmed title value", () => {
      const quest = createTestQuest()
      const result = updateQuestTitle(quest, "  quest title  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_update_title")

      // ts narrowing
      if (!result.ok) throw new Error("Expected updateQuestTitle to succeed")

      expect(result.value.title).toBe("quest title")
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.description).toBe(quest.description)
      expect(result.value.id).toBe(quest.id)
    })

    test("rejects an empty string title value", () => {
      const result = updateQuestTitle(createTestQuest(), "   ")

      expect(result).toEqual({
        ok: false,
        action: "quest_update_title",
        error: "QUEST_TITLE_REQUIRED"
      })
    })
  })

  describe("updateQuestDescription", () => {
    test("updates the quest description with untrimmed description value", () => {
      const quest = createTestQuest()
      const result = updateQuestDescription(quest, "  quest description  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_update_description")

      // ts narrowing
      if (!result.ok) throw new Error("Expected updateQuestDescription to succeed")

      expect(result.value.description).toBe("quest description")
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.title).toBe(quest.title)
    })

    test("rejects an empty string description value", () => {
      const result = updateQuestDescription(createTestQuest(), "   ")

      expect(result.ok).toBe(true)

      // ts narrowing
      if (!result.ok) throw new Error("Expected updateQuestDescription to succeed")

      expect(result.value.description).toBe("")
      expect(result.value.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe("markQuestPaused", () => {
    test("marks a quest as paused", () => {
      // this is an impossible date values state, but we used it to verify the function nullification
      const quest = {
        ...createTestQuest(),
        idledAt: new Date("2026-05-16T00:00:00.000Z"),
        abandonedAt: new Date("2026-05-16T00:00:00.000Z"),
        completedAt: new Date("2026-05-16T00:00:00.000Z"),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      }
      const result = markQuestPaused(quest)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_paused")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestPaused to succeed")

      expect(result.value.status).toBe("paused")
      expect(result.value.pausedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.idledAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects paused status", () => {
      const result = markQuestPaused({
        ...createTestQuest(),
        pausedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result).toEqual({
        ok: false,
        action: "quest_mark_paused",
        error: "QUEST_STATUS_ALREADY_PAUSED"
      })
    })
  })

  describe("markQuestIdle", () => {
    test("marks quest as idle", () => {
      // this is an impossible date values state, but we used it to verify the function nullification
      const quest = {
        ...createTestQuest(),
        pausedAt: new Date("2026-05-16T00:00:00.000Z"),
        abandonedAt: new Date("2026-05-16T00:00:00.000Z"),
        completedAt: new Date("2026-05-16T00:00:00.000Z"),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      }
      const result = markQuestIdle(quest)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_idle")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestIdle to succeed")

      expect(result.value.status).toBe("idle")
      expect(result.value.idledAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects idled quest", () => {
      const result = markQuestIdle({
        ...createTestQuest(),
        idledAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result).toEqual({
        ok: false,
        action: "quest_mark_idle",
        error: "QUEST_STATUS_ALREADY_IDLED"
      })
    })
  })

  describe("markQuestAbandoned", () => {
    test("marks a quest as abandoned", () => {
      // this is an impossible date values state, but we used it to verify the function nullification
      const quest = {
        ...createTestQuest(),
        pausedAt: new Date("2026-05-16T00:00:00.000Z"),
        idledAt: new Date("2026-05-16T00:00:00.000Z"),
        completedAt: new Date("2026-05-16T00:00:00.000Z"),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      }
      const result = markQuestAbandoned(quest)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_abandoned")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestAbandoned to succeed")

      expect(result.value.status).toBe("abandoned")
      expect(result.value.abandonedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.idledAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects abandoned status", () => {
      const result = markQuestAbandoned({
        ...createTestQuest(),
        abandonedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result).toEqual({
        ok: false,
        action: "quest_mark_abandoned",
        error: "QUEST_STATUS_ALREADY_ABANDONED"
      })
    })
  })

  describe("markQuestCompleted", () => {
    test("marks a quest as completed", () => {
      const quest = {
        ...createTestQuest(),
        pausedAt: new Date("2026-05-16T00:00:00.000Z"),
        idledAt: new Date("2026-05-16T00:00:00.000Z"),
        abandonedAt: new Date("2026-05-16T00:00:00.000Z"),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      }
      const result = markQuestCompleted(quest)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_completed")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestCompleted to succeed")

      expect(result.value.status).toBe("completed")
      expect(result.value.completedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.idledAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects marking an already completed quest as completed", () => {
      const result = markQuestCompleted({
        ...createTestQuest(),
        completedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result).toEqual({
        ok: false,
        action: "quest_mark_completed",
        error: "QUEST_STATUS_ALREADY_COMPLETED"
      })
    })
  })

  describe("markQuestRemoved", () => {
    test("marks a quest as removed", () => {
      // this is an impossible date values state, but we used it to verify the function nullification
      const quest = {
        ...createTestQuest(),
        pausedAt: new Date("2026-05-16T00:00:00.000Z"),
        idledAt: new Date("2026-05-16T00:00:00.000Z"),
        abandonedAt: new Date("2026-05-16T00:00:00.000Z"),
        completedAt: new Date("2026-05-16T00:00:00.000Z")
      }
      const result = markQuestRemoved(quest)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_removed")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestRemoved to succeed")

      expect(result.value.status).toBe("removed")
      expect(result.value.removedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.pausedAt).toBeNull()
      expect(result.value.idledAt).toBeNull()
      expect(result.value.abandonedAt).toBeNull()
      expect(result.value.completedAt).toBeNull()
    })

    test("rejects removed status", () => {
      const result = markQuestRemoved({
        ...createTestQuest(),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result).toEqual({
        ok: false,
        action: "quest_mark_removed",
        error: "QUEST_STATUS_ALREADY_REMOVED"
      })
    })
  })

  describe("markQuestActive", () => {
    test("marks a removed quest as active", () => {
      const result = markQuestActive({
        ...createTestQuest(),
        status: "removed",
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result.ok).toBe(true)
      expect(result.action).toBe("quest_mark_active")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markQuestActive to succeed")

      expect(result.value.status).toBe("active")
      expect(result.value.updatedAt).toBeInstanceOf(Date)
      expect(result.value.removedAt).toBeNull()
    })
  })
})

describe("note actions", () => {
  describe("createNote", () => {
    test("creates a note with a quest id and untrimmed text value", () => {
      const noteId = crypto.randomUUID()
      const questId = crypto.randomUUID()
      const result = createNote(noteId, "  note text  ", questId)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("note_create")

      // ts narrowing
      if (!result.ok) throw new Error("Expected createNote to succeed")

      // expect(result.value.id).toBe(noteId)
      expect(result.value.questId).toBe(questId)
      expect(result.value.text).toBe("note text")
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("creates a note with only an untrimmed text value without quest id", () => {
      const noteId = crypto.randomUUID()
      const questId = null
      const result = createNote(noteId, "  note text  ", questId)

      expect(result.ok).toBe(true)
      expect(result.action).toBe("note_create")

      // ts narrowing
      if (!result.ok) throw new Error("Expected createNote to succeed")

      // expect(result.value.id).toBe(noteId)
      expect(result.value.questId).toBe(questId)
      expect(result.value.text).toBe("note text")
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects an invalid note id", () => {
      const result = createNote("invalid-id", "note text", crypto.randomUUID())

      expect(result).toEqual({
        ok: false,
        action: "note_create",
        error: "NOTE_ID_INVALID"
      })
    })

    test("rejects an invalid quest id", () => {
      const result = createNote(crypto.randomUUID(), "note text", "invalid-id")

      expect(result).toEqual({
        ok: false,
        action: "note_create",
        error: "NOTE_QUEST_ID_INVALID"
      })
    })

    test("rejects an empty string text value", () => {
      const result = createNote(crypto.randomUUID(), "   ", crypto.randomUUID())

      expect(result).toEqual({
        ok: false,
        action: "note_create",
        error: "NOTE_TEXT_REQUIRED"
      })
    })
  })

  describe("updateNote", () => {
    test("updates a note with untrimmed text value", () => {
      const note = createTestNote()
      const result = updateNote(note, "  note text  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("note_update")

      // ts narrowing
      if (!result.ok) throw new Error("Expected updateNote to succeed")

      expect(result.value.text).toBe("note text")
      expect(result.value.id).toBe(note.id)
      expect(result.value.questId).toBe(note.questId)
      expect(result.value.updatedAt).toBe(note.updatedAt)
    })

    test("rejects an empty string text value", () => {
      const result = updateNote(createTestNote(), "   ")

      expect(result).toEqual({
        ok: false,
        action: "note_update",
        error: "NOTE_TEXT_REQUIRED"
      })
    })
  })

  describe("markNoteRemoved", () => {
    test("marks a note as removed", () => {
      const result = markNoteRemoved(createTestNote())

      expect(result.ok).toBe(true)
      expect(result.action).toBe("note_mark_removed")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markNoteRemoved to succeed")

      expect(result.value.removedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe("markNoteActive", () => {
    test("marks a removed note as active", () => {
      const result = markNoteActive({
        ...createTestNote(),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result.ok).toBe(true)
      expect(result.action).toBe("note_mark_active")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markNoteActive to succeed")

      expect(result.value.removedAt).toBeNull()
      expect(result.value.updatedAt).toBeInstanceOf(Date)
    })
  })
})

describe("progress actions", () => {
  describe("createProgress", () => {
    test("creates a progress with untrimmed text value", () => {
      const progressId = crypto.randomUUID()
      const questId = crypto.randomUUID()
      const result = createProgress(progressId, questId, "  progress text  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("progress_create")

      // ts narrowing
      if (!result.ok) throw new Error("Expected createProgress to succeed")

      // expect(result.value.id).toBe(progressId)
      expect(result.value.questId).toBe(questId)
      expect(result.value.text).toBe("progress text")
      expect(result.value.createdAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeNull()
      expect(result.value.removedAt).toBeNull()
    })

    test("rejects an invalid progress id", () => {
      const result = createProgress("invalid-id", crypto.randomUUID(), "progress text")

      expect(result).toEqual({
        ok: false,
        action: "progress_create",
        error: "PROGRESS_ID_INVALID"
      })
    })

    test("rejects an invalid quest id", () => {
      const result = createProgress(crypto.randomUUID(), "invalid-id", "progress text")

      expect(result).toEqual({
        ok: false,
        action: "progress_create",
        error: "PROGRESS_QUEST_ID_INVALID"
      })
    })

    test("rejects an empty string text value", () => {
      const result = createProgress(crypto.randomUUID(), crypto.randomUUID(), "   ")

      expect(result).toEqual({
        ok: false,
        action: "progress_create",
        error: "PROGRESS_TEXT_REQUIRED"
      })
    })
  })

  describe("updateProgress", () => {
    test("updates a progress with untrimmed text value", () => {
      const progress = createTestProgress()
      const result = updateProgress(progress, "  progress text  ")

      expect(result.ok).toBe(true)
      expect(result.action).toBe("progress_update")

      // ts narrowing
      if (!result.ok) throw new Error("Expected updateProgress to succeed")

      expect(result.value.text).toBe("progress text")
      expect(result.value.id).toBe(progress.id)
      expect(result.value.questId).toBe(progress.questId)
      expect(result.value.updatedAt).toBe(progress.updatedAt)
    })

    test("rejects an empty string text value", () => {
      const result = updateProgress(createTestProgress(), "   ")

      expect(result).toEqual({
        ok: false,
        action: "progress_update",
        error: "PROGRESS_TEXT_REQUIRED"
      })
    })
  })

  describe("markProgressRemoved", () => {
    test("marks a progress as removed", () => {
      const result = markProgressRemoved(createTestProgress())

      expect(result.ok).toBe(true)
      expect(result.action).toBe("progress_mark_removed")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markProgressRemoved to succeed")

      expect(result.value.removedAt).toBeInstanceOf(Date)
      expect(result.value.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe("markProgressActive", () => {
    test("marks a removed progress as active", () => {
      const result = markProgressActive({
        ...createTestProgress(),
        removedAt: new Date("2026-05-16T00:00:00.000Z")
      })

      expect(result.ok).toBe(true)
      expect(result.action).toBe("progress_mark_active")

      // ts narrowing
      if (!result.ok) throw new Error("Expected markProgressActive to succeed")

      expect(result.value.removedAt).toBeNull()
      expect(result.value.updatedAt).toBeInstanceOf(Date)
    })
  })
})
