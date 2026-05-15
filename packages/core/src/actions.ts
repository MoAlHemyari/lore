import {
  type Quest,
  type QuestKind,
  type QuestLifecycleStatus,
  type QuestDraft,
  type Note,
  type NoteDraft,
  type ProgressDraft,
  type Progress,
  questLifecycleStatuses,
  questKinds
} from "./entities"
import type { NoteActionError, ProgressActionError, QuestActionError } from "./errors"

const actionKinds = [
  // quest actions
  "quest_create",
  "quest_update_title",
  "quest_update_description",
  "quest_pause",
  "quest_idle",
  "quest_abandon",
  "quest_complete",
  "quest_remove",
  "quest_restore",

  // note actions
  "note_create",
  "note_update",
  "note_remove",
  "note_restore",

  // progress actions
  "progress_create",
  "progress_update",
  "progress_remove",
  "progress_restore"
] as const
type ActionKind = (typeof actionKinds)[number]

type ActionResult<T, E> =
  | {
      ok: true
      action: ActionKind
      value: T
    }
  | {
      ok: false
      action: ActionKind
      error: E
    }

export function createQuest(
  title: Quest["title"],
  kind: QuestKind = "main",
  status: QuestLifecycleStatus = "active",
  description: Quest["description"] = ""
): ActionResult<QuestDraft, QuestActionError> {
  const t = title.trim()
  if (t.length === 0) return { ok: false, action: "quest_create", error: "TITLE_REQUIRED" }

  if (!(kind.toLocaleUpperCase() in questKinds))
    return { ok: false, action: "quest_create", error: "KIND_INVALID" }

  if (!(status.toLocaleUpperCase() in questLifecycleStatuses))
    return { ok: false, action: "quest_create", error: "STATUS_INVALID" }

  if (status === "removed")
    return { ok: false, action: "quest_create", error: "STATUS_CANNOT_BE_INITIALIZED_WITH_REMOVED" }

  if (status === "idle")
    return { ok: false, action: "quest_create", error: "STATUS_CANNOT_BE_INITIALIZED_WITH_IDLED" }

  const createdQuest: QuestDraft = {
    title: t,
    description,
    kind,
    status,

    notes: [],
    progress: [],

    pausedAt: null,
    idledAt: null,
    abandonedAt: null,
    completedAt: null,
    updatedAt: null,
    removedAt: null,

    createdAt: new Date()
  }

  return { ok: true, action: "quest_create", value: createdQuest }
}

export function updateQuestTitle(
  quest: Quest,
  newTitle: Quest["title"]
): ActionResult<Quest, QuestActionError> {
  const t = newTitle.trim()
  if (t.length === 0) return { ok: false, action: "quest_update_title", error: "TITLE_REQUIRED" }

  const updatedQuest: Quest = {
    ...quest,
    title: t,
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_update_title", value: updatedQuest }
}

export function updateQuestDescription(
  quest: Quest,
  newDescription: Quest["description"]
): ActionResult<Quest, QuestActionError> {
  const t = newDescription.trim()

  const updatedQuest: Quest = {
    ...quest,
    description: t,
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_update_description", value: updatedQuest }
}

export function pauseQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  if (quest.pausedAt) return { ok: false, action: "quest_pause", error: "STATUS_ALREADY_PAUSED" }

  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.PAUSED,

    idledAt: null,
    abandonedAt: null,
    completedAt: null,
    removedAt: null,

    pausedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_pause", value: updatedQuest }
}

export function abandonQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  if (quest.abandonedAt) return { ok: false, action: "quest_abandon", error: "STATUS_ALREADY_COMPLETED" }

  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.ABANDONED,

    idledAt: null,
    pausedAt: null,
    completedAt: null,
    removedAt: null,

    abandonedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_abandon", value: updatedQuest }
}

export function completeQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  if (quest.completedAt) return { ok: false, action: "quest_complete", error: "STATUS_ALREADY_COMPLETED" }

  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.COMPLETED,

    idledAt: null,
    pausedAt: null,
    abandonedAt: null,
    removedAt: null,

    completedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_complete", value: updatedQuest }
}

export function idleQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  if (quest.idledAt) return { ok: false, action: "quest_idle", error: "STATUS_ALREADY_IDLED" }

  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.IDLE,

    pausedAt: null,
    abandonedAt: null,
    completedAt: null,
    removedAt: null,

    idledAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_idle", value: updatedQuest }
}

export function removeQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  if (quest.removedAt) return { ok: false, action: "quest_remove", error: "STATUS_ALREADY_REMOVED" }

  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.REMOVED,

    idledAt: null,
    pausedAt: null,
    abandonedAt: null,
    completedAt: null,

    removedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_remove", value: updatedQuest }
}

export function restoreQuest(quest: Quest): ActionResult<Quest, QuestActionError> {
  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.ACTIVE,

    removedAt: null,
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_restore", value: updatedQuest }
}

export function createNote(
  questId: Quest["id"],
  text: Note["text"]
): ActionResult<NoteDraft, NoteActionError> {
  const t = text.trim()

  if (t.length === 0) return { ok: false, action: "note_create", error: "TEXT_REQUIRED" }

  const createdNote: NoteDraft = {
    questId,
    text: t,

    removedAt: null,
    updatedAt: null,
    createdAt: new Date()
  }

  return { ok: true, action: "note_create", value: createdNote }
}

export function updateNote(note: Note, text: NoteDraft["text"]): ActionResult<Note, NoteActionError> {
  const t = text.trim()

  if (t.length === 0) return { ok: false, action: "note_update", error: "TEXT_REQUIRED" }

  const updatedNote: Note = { ...note, text: t }

  return { ok: true, action: "note_update", value: updatedNote }
}

export function removeNote(note: Note): ActionResult<Note, NoteActionError> {
  const updatedNote: Note = {
    ...note,
    removedAt: new Date(),
    updatedAt: new Date()
  }
  return { ok: true, action: "note_remove", value: updatedNote }
}

export function restoreNote(note: Note): ActionResult<Note, NoteActionError> {
  const updatedNote: Note = {
    ...note,
    removedAt: null,
    updatedAt: new Date()
  }
  return { ok: true, action: "note_restore", value: updatedNote }
}

export function createProgress(
  questId: Quest["id"],
  text: ProgressDraft["text"]
): ActionResult<ProgressDraft, ProgressActionError> {
  const t = text.trim()
  if (t.length === 0) return { ok: false, action: "progress_create", error: "PROGRESS_TEXT_REQUIRED" }

  const createdProgress: ProgressDraft = {
    questId,
    text: t,

    removedAt: null,
    updatedAt: null,
    createdAt: new Date()
  }

  return { ok: true, action: "progress_create", value: createdProgress }
}

export function updateProgress(
  progress: Progress,
  text: Progress["text"]
): ActionResult<Progress, ProgressActionError> {
  const t = text.trim()
  if (t.length === 0) return { ok: false, action: "progress_update", error: "PROGRESS_TEXT_REQUIRED" }

  const updatedProgress: Note = {
    ...progress,
    text: t
  }

  return { ok: true, action: "progress_update", value: updatedProgress }
}

export function removeProgress(progress: Progress): ActionResult<Progress, ProgressActionError> {
  const updatedProgress: Progress = {
    ...progress,
    removedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "progress_remove", value: updatedProgress }
}

export function restoreProgress(progress: Progress): ActionResult<Progress, ProgressActionError> {
  const updatedProgress: Progress = {
    ...progress,
    removedAt: null,
    updatedAt: new Date()
  }

  return { ok: true, action: "progress_restore", value: updatedProgress }
}
