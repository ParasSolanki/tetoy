CREATE TABLE `storage_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`storage_id` text NOT NULL,
	`row` integer,
	`column` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`storage_id`) REFERENCES `storages`(`id`) ON UPDATE no action ON DELETE cascade
);
