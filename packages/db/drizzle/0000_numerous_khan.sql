CREATE TABLE `notes` (
	`quest_id` text,
	`text` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`quest_id` text NOT NULL,
	`text` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`kind` text NOT NULL,
	`status` text,
	`paused_at` integer,
	`idled_at` integer,
	`abandoned_at` integer,
	`completed_at` integer,
	`id` text PRIMARY KEY NOT NULL,
	`removed_at` integer,
	`updated_at` integer,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT "check_kind" CHECK("quests"."kind" IN ('main', 'side')),
	CONSTRAINT "check_status" CHECK("quests"."status" IN ('active', 'idle', 'paused', 'abandoned', 'completed', 'removed'))
);
