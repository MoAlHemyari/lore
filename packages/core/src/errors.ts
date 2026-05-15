const questActionErrors = {
  TITLE_REQUIRED: "A title is required for the quest.",
  KIND_INVALID: "The quest kind provided is invalid.",
  STATUS_INVALID: "The quest status provided is invalid.",
  STATUS_ALREADY_PAUSED: "The quest is already paused.",
  STATUS_ALREADY_IDLED: "The quest is already idled.",
  STATUS_ALREADY_ABANDONED: "The quest is already abandoned.",
  STATUS_ALREADY_COMPLETED: "The quest is already completed.",
  STATUS_ALREADY_REMOVED: "The quest has already been removed.",
  STATUS_CANNOT_BE_INITIALIZED_WITH_REMOVED: "A quest cannot be initialized with a status of removed.",
  STATUS_CANNOT_BE_INITIALIZED_WITH_IDLED: "A quest cannot be initialized with a status of idled."
} as const
export type QuestActionError = keyof typeof questActionErrors

const noteActionErrors = {
  TEXT_REQUIRED: "A note must have text."
} as const
export type NoteActionError = keyof typeof noteActionErrors

const progressActionErrors = {
  PROGRESS_TEXT_REQUIRED: "Progress text cannot be empty."
} as const
export type ProgressActionError = keyof typeof progressActionErrors
