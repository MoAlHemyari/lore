interface BaseCoreEntity {
  id: string
  createdAt: Date
  removedAt: Date | null
  updatedAt: Date
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

export interface Quest extends BaseCoreEntity {
  kind: QuestKind
  title: string
  description: string
  status: QuestLifecycleStatus

  pausedAt: Date | null
  idledAt: Date | null
  abandonedAt: Date | null
  completedAt: Date | null
}

export interface Note extends BaseCoreEntity {
  questId: Quest["id"] | null
  text: string
}

export interface Progress extends BaseCoreEntity {
  questId: Quest["id"]
  text: string
}
