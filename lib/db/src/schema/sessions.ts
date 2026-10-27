import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usuariosTable } from "./usuarios";

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  usuarioId: integer("usuario_id")
    .references(() => usuariosTable.id)
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresEm: timestamp("expires_em").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
  ativo: text("ativo").default("true"),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
  ativo: true,
});

export type Session = typeof sessionsTable.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
