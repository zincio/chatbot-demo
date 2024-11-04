CREATE TABLE IF NOT EXISTS "Chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp NOT NULL,
	"messages" json NOT NULL
);
