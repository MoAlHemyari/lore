import type { InferSelectModel } from "drizzle-orm"
import type { Journey, Note, Progress, Quest } from "@lore/core"
import {
  journeys as journeysTable,
  quests as questsTable,
  notes as notesTable,
  progress as progressTable
} from "./schema"
import type { ErrorCode } from "./errors"

type ParseResult<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: ErrorCode
    }

type JourneyRow = InferSelectModel<typeof journeysTable>
export function mapJourneyDBToDomain(row: JourneyRow): ParseResult<Journey> {
  const journey: Journey = {
    ...row,
    archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
    removedAt: row.removedAt ? new Date(row.removedAt) : null,
    updatedAt: new Date(row.updatedAt),
    createdAt: new Date(row.createdAt)
  }

  if (Number.isNaN(journey.createdAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (Number.isNaN(journey.updatedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (journey.removedAt && Number.isNaN(journey.removedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (journey.archivedAt && Number.isNaN(journey.archivedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }

  return { ok: true, value: journey }
}

type QuestRow = InferSelectModel<typeof questsTable>
export function mapQuestDBToDomain(row: QuestRow): ParseResult<Quest> {
  const quest: Quest = {
    ...row,
    pausedAt: row.pausedAt ? new Date(row.pausedAt) : null,
    abandonedAt: row.abandonedAt ? new Date(row.abandonedAt) : null,
    completedAt: row.completedAt ? new Date(row.completedAt) : null,
    idledAt: row.idledAt ? new Date(row.idledAt) : null,
    removedAt: row.removedAt ? new Date(row.removedAt) : null,
    updatedAt: new Date(row.updatedAt),
    createdAt: new Date(row.createdAt)
  }

  if (Number.isNaN(quest.createdAt.getTime())) return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (Number.isNaN(quest.updatedAt.getTime())) return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (quest.removedAt && Number.isNaN(quest.removedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (quest.idledAt && Number.isNaN(quest.idledAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (quest.completedAt && Number.isNaN(quest.completedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (quest.pausedAt && Number.isNaN(quest.pausedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (quest.abandonedAt && Number.isNaN(quest.abandonedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }

  return { ok: true, value: quest }
}

type NoteRow = InferSelectModel<typeof notesTable>
export function mapNoteDBToDomain(row: NoteRow): ParseResult<Note> {
  const note: Note = {
    ...row,
    removedAt: row.removedAt ? new Date(row.removedAt) : null,
    updatedAt: new Date(row.updatedAt),
    createdAt: new Date(row.createdAt)
  }

  if (Number.isNaN(note.createdAt.getTime())) return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (Number.isNaN(note.updatedAt.getTime())) return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (note.removedAt && Number.isNaN(note.removedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }

  return { ok: true, value: note }
}

type ProgressRow = InferSelectModel<typeof progressTable>
export function mapProgressDBToDomain(row: ProgressRow): ParseResult<Progress> {
  const progress: Progress = {
    ...row,
    removedAt: row.removedAt ? new Date(row.removedAt) : null,
    updatedAt: new Date(row.updatedAt),
    createdAt: new Date(row.createdAt)
  }

  if (Number.isNaN(progress.createdAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (Number.isNaN(progress.updatedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }
  if (progress.removedAt && Number.isNaN(progress.removedAt.getTime()))
    return { ok: false, error: "FAILED_TO_PARSE_TO_DOMAIN_SHAPE" }

  return { ok: true, value: progress }
}
