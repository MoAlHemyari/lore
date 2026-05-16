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
import { type ErrorCode } from "./errors"

const actionKinds = [
  // quest actions
  "quest_create",
  "quest_update_title",
  "quest_update_description",
  "quest_mark_paused",
  "quest_mark_idle",
  "quest_mark_abandoned",
  "quest_mark_completed",
  "quest_mark_removed",
  "quest_mark_active",

  // note actions
  "note_create",
  "note_update",
  "note_mark_removed",
  "note_mark_active",

  // progress actions
  "progress_create",
  "progress_update",
  "progress_mark_removed",
  "progress_mark_active"
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
): ActionResult<QuestDraft, ErrorCode> {
  const t = title.trim()
  if (t.length === 0) return { ok: false, action: "quest_create", error: "QUEST_TITLE_REQUIRED" }

  if (!(kind.toLocaleUpperCase() in questKinds))
    return { ok: false, action: "quest_create", error: "QUEST_KIND_INVALID" }

  if (!(status.toLocaleUpperCase() in questLifecycleStatuses))
    return { ok: false, action: "quest_create", error: "QUEST_STATUS_INVALID" }

  if (status === "removed")
    return {
      ok: false,
      action: "quest_create",
      error: "QUEST_STATUS_CANNOT_BE_INITIALIZED_WITH_REMOVED"
    }

  if (status === "idle")
    return {
      ok: false,
      action: "quest_create",
      error: "QUEST_STATUS_CANNOT_BE_INITIALIZED_WITH_IDLED"
    }

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

export function updateQuestTitle(quest: Quest, newTitle: Quest["title"]): ActionResult<Quest, ErrorCode> {
  const t = newTitle.trim()
  if (t.length === 0) return { ok: false, action: "quest_update_title", error: "QUEST_TITLE_REQUIRED" }

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
): ActionResult<Quest, ErrorCode> {
  const t = newDescription.trim()

  const updatedQuest: Quest = {
    ...quest,
    description: t,
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_update_description", value: updatedQuest }
}

export function markQuestPaused(quest: Quest): ActionResult<Quest, ErrorCode> {
  if (quest.pausedAt)
    return {
      ok: false,
      action: "quest_mark_paused",
      error: "QUEST_STATUS_ALREADY_PAUSED"
    }

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

  return { ok: true, action: "quest_mark_paused", value: updatedQuest }
}

export function markQuestAbandoned(quest: Quest): ActionResult<Quest, ErrorCode> {
  if (quest.abandonedAt)
    return {
      ok: false,
      action: "quest_mark_abandoned",
      error: "QUEST_STATUS_ALREADY_ABANDONED"
    }

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

  return { ok: true, action: "quest_mark_abandoned", value: updatedQuest }
}

export function markQuestCompleted(quest: Quest): ActionResult<Quest, ErrorCode> {
  if (quest.completedAt)
    return {
      ok: false,
      action: "quest_mark_completed",
      error: "QUEST_STATUS_ALREADY_COMPLETED"
    }

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

  return { ok: true, action: "quest_mark_completed", value: updatedQuest }
}

export function markQuestIdle(quest: Quest): ActionResult<Quest, ErrorCode> {
  if (quest.idledAt)
    return {
      ok: false,
      action: "quest_mark_idle",
      error: "QUEST_STATUS_ALREADY_IDLED"
    }

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

  return { ok: true, action: "quest_mark_idle", value: updatedQuest }
}

export function markQuestRemoved(quest: Quest): ActionResult<Quest, ErrorCode> {
  if (quest.removedAt)
    return {
      ok: false,
      action: "quest_mark_removed",
      error: "QUEST_STATUS_ALREADY_REMOVED"
    }

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

  return { ok: true, action: "quest_mark_removed", value: updatedQuest }
}

export function markQuestActive(quest: Quest): ActionResult<Quest, ErrorCode> {
  const updatedQuest: Quest = {
    ...quest,
    status: questLifecycleStatuses.ACTIVE,

    removedAt: null,
    updatedAt: new Date()
  }

  return { ok: true, action: "quest_mark_active", value: updatedQuest }
}

export function createNote(questId: Quest["id"], text: Note["text"]): ActionResult<NoteDraft, ErrorCode> {
  const t = text.trim()

  if (t.length === 0) return { ok: false, action: "note_create", error: "NOTE_TEXT_REQUIRED" }

  const createdNote: NoteDraft = {
    questId,
    text: t,

    removedAt: null,
    updatedAt: null,
    createdAt: new Date()
  }

  return { ok: true, action: "note_create", value: createdNote }
}

export function updateNote(note: Note, text: NoteDraft["text"]): ActionResult<Note, ErrorCode> {
  const t = text.trim()

  if (t.length === 0) return { ok: false, action: "note_update", error: "NOTE_TEXT_REQUIRED" }

  const updatedNote: Note = { ...note, text: t }

  return { ok: true, action: "note_update", value: updatedNote }
}

export function markNoteRemoved(note: Note): ActionResult<Note, ErrorCode> {
  const updatedNote: Note = {
    ...note,
    removedAt: new Date(),
    updatedAt: new Date()
  }
  return { ok: true, action: "note_mark_removed", value: updatedNote }
}

export function markNoteActive(note: Note): ActionResult<Note, ErrorCode> {
  const updatedNote: Note = {
    ...note,
    removedAt: null,
    updatedAt: new Date()
  }
  return { ok: true, action: "note_mark_active", value: updatedNote }
}

export function createProgress(
  questId: Quest["id"],
  text: ProgressDraft["text"]
): ActionResult<ProgressDraft, ErrorCode> {
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
): ActionResult<Progress, ErrorCode> {
  const t = text.trim()
  if (t.length === 0) return { ok: false, action: "progress_update", error: "PROGRESS_TEXT_REQUIRED" }

  const updatedProgress: Note = {
    ...progress,
    text: t
  }

  return { ok: true, action: "progress_update", value: updatedProgress }
}

export function markProgressRemoved(progress: Progress): ActionResult<Progress, ErrorCode> {
  const updatedProgress: Progress = {
    ...progress,
    removedAt: new Date(),
    updatedAt: new Date()
  }

  return { ok: true, action: "progress_mark_removed", value: updatedProgress }
}

export function markProgressActive(progress: Progress): ActionResult<Progress, ErrorCode> {
  const updatedProgress: Progress = {
    ...progress,
    removedAt: null,
    updatedAt: new Date()
  }

  return { ok: true, action: "progress_mark_active", value: updatedProgress }
}
