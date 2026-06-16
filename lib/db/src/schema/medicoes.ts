import { pgTable, text, serial, integer, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";

export const STATUS_MEDICAO = ["rascunho", "aguardando_engenheiro", "aguardando_gestor", "aprovada", "paga"] as const;

export const medicoesTable = pgTable("medicoes", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  periodoInicio: date("periodo_inicio").notNull(),
  periodoFim: date("periodo_fim").notNull(),
  valorTotal: numeric("valor_total", { precision: 15, scale: 2 }).notNull(),
  valorAcumulado: numeric("valor_acumulado", { precision: 15, scale: 2 }).default("0"),
  status: varchar("status", { length: 30 }).default("rascunho").notNull(),
  aprovadoPor: integer("aprovado_por"),
  aprovadoEm: timestamp("aprovado_em"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertMedicaoSchema = createInsertSchema(medicoesTable).omit({ id: true, criadoEm: true });
export type InsertMedicao = z.infer<typeof insertMedicaoSchema>;
export type Medicao = typeof medicoesTable.$inferSelect;
