import { Message } from 'ai';
import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  messages: json('messages').notNull(),
});

export type Chat = Omit<InferSelectModel<typeof chat>, 'messages'> & {
  messages: Array<Message>;
};
