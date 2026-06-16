import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { visitasTable } from "./visitas";
import { obrasTable } from "./obras";

export const SEVERIDADES = ["leve", "moderada", "grave", "critica"] as const;
export const STATUS_NC = ["pendente", "em_correcao", "resolvida", "vencida"] as const;

export const naoConformidadesTable = pgTable("nao_conformidades", {
  id: serial("id").primaryKey(),
  visitaId: integer("visita_id").references(() => visitasTable.id).notNull(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  severidade: varchar("severidade", { length: 20 }).notNull(),
  descricao: text("descricao").notNull(),
  prazoCorrecaoDias: integer("prazo_correcao_dias"),
  status: varchar("status", { length: 20 }).default("pendente").notNull(),
  resolvidaEm: timestamp("resolvida_em"),
  resolucaoDescricao: text("resolucao_descricao"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertNaoConformidadeSchema = createInsertSchema(naoConformidadesTable).omit({ id: true, criadoEm: true });
export type InsertNaoConformidade = z.infer<typeof insertNaoConformidadeSchema>;
export type NaoConformidade = typeof naoConformidadesTable.$inferSelect;
