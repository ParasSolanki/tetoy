CREATE TABLE `storage_boxes` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_id` text NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`grade` text NOT NULL,
	`price` real NOT NULL,
	`weight` real NOT NULL,
	`sub_grade` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`checked_out_at` integer,
	FOREIGN KEY (`storage_id`) REFERENCES `storages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
