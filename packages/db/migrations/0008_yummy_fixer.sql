DROP TABLE IF EXISTS `storage_boxes`;
--> statement-breakpoint
CREATE TABLE `storage_boxes` (
	`id` text PRIMARY KEY NOT NULL,
	`block_id` text NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`total_boxes` integer NOT NULL,
	`checked_out_boxes` integer DEFAULT 0 NOT NULL,
	`grade` text NOT NULL,
	`price` real NOT NULL,
	`weight` real NOT NULL,
	`sub_grade` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`checked_out_at` integer,
	FOREIGN KEY (`block_id`) REFERENCES `storage_blocks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
