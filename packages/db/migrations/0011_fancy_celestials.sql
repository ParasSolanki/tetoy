ALTER TABLE storage_boxes ADD `total_boxes` integer NOT NULL;--> statement-breakpoint
ALTER TABLE storage_boxes ADD `checked_out_boxes` integer DEFAULT 0 NOT NULL;