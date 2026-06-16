import { pgTable, text, serial, integer, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";

export const aditivosTable = pgTable("aditivos", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  tipo: varchar("tipo", { length: 20 }).notNull(),
  numeroAditivo: integer("numero_aditivo").notNull(),
  justificativa: text("justificativa").notNull(),
  dataAssinatura: date("data_assinatura").notNull(),
  valorAcrescimo: numeric("valor_acrescimo", { precision: 15, scale: 2 }),
  diasAcrescimo: integer("dias_acrescimo"),
  percentualAcrescimo: numeric("percentual_acrescimo", { precision: 6, scale: 2 }),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertAditivoSchema = createInsertSchema(aditivosTable).omit({ id: true, criadoEm: true });
export type InsertAditivo = z.infer<typeof insertAditivoSchema>;
export type Aditivo = typeof aditivosTable.$inferSelect;
