import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const municipiosTable = pgTable("municipios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  estado: varchar("estado", { length: 2 }),
  plano: varchar("plano", { length: 20 }).default("basico"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertMunicipioSchema = createInsertSchema(municipiosTable).omit({ id: true, criadoEm: true });
export type InsertMunicipio = z.infer<typeof insertMunicipioSchema>;
export type Municipio = typeof municipiosTable.$inferSelect;
