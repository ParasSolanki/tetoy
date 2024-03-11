CREATE TABLE `storages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`dimension` text NOT NULL,
	`capacity` text NOT NULL,
	`product_id` text NOT NULL,
	`supervisor_id` text NOT NULL,
	`created_by_id` text NOT NULL,
	`updated_by_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	`deleted_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
