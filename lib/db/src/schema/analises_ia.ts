import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";

export const analisesIATable = pgTable("analises_ia", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  eventoGatilho: varchar("evento_gatilho", { length: 50 }),
  nivelRisco: varchar("nivel_risco", { length: 20 }).notNull(),
  analiseTexto: text("analise_texto").notNull(),
  acoesRecomendadas: text("acoes_recomendadas"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertAnaliseIASchema = createInsertSchema(analisesIATable).omit({ id: true, criadoEm: true });
export type InsertAnaliseIA = z.infer<typeof insertAnaliseIASchema>;
export type AnaliseIA = typeof analisesIATable.$inferSelect;
