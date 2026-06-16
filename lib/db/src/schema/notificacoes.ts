import { pgTable, text, serial, integer, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";

export const notificacoesTable = pgTable("notificacoes", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  tipo: varchar("tipo", { length: 40 }).notNull(),
  status: varchar("status", { length: 20 }).default("pendente").notNull(),
  descricao: text("descricao").notNull(),
  enviadoEm: timestamp("enviado_em").defaultNow().notNull(),
  prazoResposta: date("prazo_resposta"),
  textoResposta: text("texto_resposta"),
  numeroSequencial: integer("numero_sequencial").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertNotificacaoSchema = createInsertSchema(notificacoesTable).omit({ id: true, criadoEm: true, enviadoEm: true });
export type InsertNotificacao = z.infer<typeof insertNotificacaoSchema>;
export type Notificacao = typeof notificacoesTable.$inferSelect;
