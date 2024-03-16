CREATE TABLE `storage_activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text,
	`message` text,
	`storage_id` text NOT NULL,
	`user_id` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`storage_id`) REFERENCES `storages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
