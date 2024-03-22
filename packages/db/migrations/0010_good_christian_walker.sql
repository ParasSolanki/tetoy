CREATE TABLE `countries_temp` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
INSERT INTO `countries_temp` SELECT * FROM `countries`;
--> statement-breakpoint
DROP TABLE `countries`;
--> statement-breakpoint
ALTER TABLE `countries_temp` RENAME TO `countries`
