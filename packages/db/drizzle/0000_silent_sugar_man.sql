CREATE TABLE `notes` (
	`quest_id` text,
	`text` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_removed_at_format" CHECK("notes"."removed_at" IS NULL OR datetime("notes"."removed_at") IS NOT NULL),
	CONSTRAINT "check_removed_at_after_created" CHECK("notes"."removed_at" IS NULL OR "notes"."removed_at" >= "notes"."created_at")
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`quest_id` text NOT NULL,
	`text` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "check_removed_at_format" CHECK("progress"."removed_at" IS NULL OR datetime("progress"."removed_at") IS NOT NULL),
	CONSTRAINT "check_removed_at_after_created" CHECK("progress"."removed_at" IS NULL OR "progress"."removed_at" >= "progress"."created_at")
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`paused_at` text,
	`idled_at` text,
	`abandoned_at` text,
	`completed_at` text,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT "check_removed_at_format" CHECK("quests"."removed_at" IS NULL OR datetime("quests"."removed_at") IS NOT NULL),
	CONSTRAINT "check_removed_at_after_created" CHECK("quests"."removed_at" IS NULL OR "quests"."removed_at" >= "quests"."created_at"),
	CONSTRAINT "check_kind" CHECK("quests"."kind" IN ('main', 'side')),
	CONSTRAINT "check_status" CHECK("quests"."status" IN ('active', 'idle', 'paused', 'abandoned', 'completed', 'removed')),
	CONSTRAINT "check_paused_at_format" CHECK("quests"."paused_at" IS NULL OR datetime("quests"."paused_at") IS NOT NULL),
	CONSTRAINT "check_idled_at_format" CHECK("quests"."idled_at" IS NULL OR datetime("quests"."idled_at") IS NOT NULL),
	CONSTRAINT "check_abandoned_at_format" CHECK("quests"."abandoned_at" IS NULL OR datetime("quests"."abandoned_at") IS NOT NULL),
	CONSTRAINT "check_completed_at_format" CHECK("quests"."completed_at" IS NULL OR datetime("quests"."completed_at") IS NOT NULL),
	CONSTRAINT "check_paused_at_after_created" CHECK("quests"."paused_at" IS NULL OR "quests"."paused_at" >= "quests"."created_at"),
	CONSTRAINT "check_idled_at_after_created" CHECK("quests"."idled_at" IS NULL OR "quests"."idled_at" >= "quests"."created_at"),
	CONSTRAINT "check_abandoned_at_after_created" CHECK("quests"."abandoned_at" IS NULL OR "quests"."abandoned_at" >= "quests"."created_at"),
	CONSTRAINT "check_completed_at_after_created" CHECK("quests"."completed_at" IS NULL OR "quests"."completed_at" >= "quests"."created_at"),
	CONSTRAINT "check_paused_at_status" CHECK("quests"."status" != 'paused' OR "quests"."paused_at" IS NOT NULL),
	CONSTRAINT "check_idled_at_status" CHECK("quests"."status" != 'idle' OR "quests"."idled_at" IS NOT NULL),
	CONSTRAINT "check_abandoned_at_status" CHECK("quests"."status" != 'abandoned' OR "quests"."abandoned_at" IS NOT NULL),
	CONSTRAINT "check_completed_at_status" CHECK("quests"."status" != 'completed' OR "quests"."completed_at" IS NOT NULL),
	CONSTRAINT "check_removed_at_status" CHECK("quests"."status" != 'removed' OR "quests"."removed_at" IS NOT NULL)
);
