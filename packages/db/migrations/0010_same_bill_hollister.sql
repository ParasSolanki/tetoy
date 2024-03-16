CREATE TABLE `storage_boxes_countries` (
	`id` text PRIMARY KEY NOT NULL,
	`box_id` text NOT NULL,
	`country_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`box_id`) REFERENCES `storage_boxes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON UPDATE no action ON DELETE no action
);
