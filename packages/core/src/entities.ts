interface BaseCoreEntityOptions {
  createdAt: Date
  removedAt: Date | null
  updatedAt: Date | null
}

export const questKinds = { MAIN: "main", SIDE: "side" } as const
export type QuestKind = (typeof questKinds)[keyof typeof questKinds]

export const questLifecycleStatuses = {
  ACTIVE: "active",
  IDLE: "idle",
  PAUSED: "paused",
  ABANDONED: "abandoned",
  COMPLETED: "completed",
  REMOVED: "removed"
} as const
export type QuestLifecycleStatus = (typeof questLifecycleStatuses)[keyof typeof questLifecycleStatuses]

export interface QuestDraft extends BaseCoreEntityOptions {
  kind: QuestKind
  title: string
  description: string
  notes: Note["id"][]
  progress: Progress["id"][]
  status: QuestLifecycleStatus

  pausedAt: Date | null
  idledAt: Date | null
  abandonedAt: Date | null
  completedAt: Date | null
}

export interface NoteDraft extends BaseCoreEntityOptions {
  questId: Quest["id"]
  text: string
}

export interface ProgressDraft extends BaseCoreEntityOptions {
  questId: Quest["id"]
  text: string
}

export interface Quest extends QuestDraft {
  id: string
}

export interface Progress extends ProgressDraft {
  id: string
}

export interface Note extends NoteDraft {
  id: string
}
