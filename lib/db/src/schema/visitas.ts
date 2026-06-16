import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";
import { usuariosTable } from "./usuarios";

export const visitasTable = pgTable("visitas", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  fiscalId: integer("fiscal_id").references(() => usuariosTable.id).notNull(),
  visitadoEm: timestamp("visitado_em").defaultNow().notNull(),
  percentualFisico: numeric("percentual_fisico", { precision: 5, scale: 2 }).notNull(),
  totalTrabalhadores: integer("total_trabalhadores"),
  atividadesExecutadas: text("atividades_executadas"),
  observacoes: text("observacoes"),
  condicoesClimaticas: text("condicoes_climaticas"),
  gpsLat: numeric("gps_lat", { precision: 10, scale: 7 }),
  gpsLng: numeric("gps_lng", { precision: 11, scale: 7 }),
  foiCriadoOffline: boolean("foi_criado_offline").default(false),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const fotosVisitaTable = pgTable("fotos_visita", {
  id: serial("id").primaryKey(),
  visitaId: integer("visita_id").references(() => visitasTable.id).notNull(),
  fileUrl: text("file_url").notNull(),
  caption: text("caption"),
  gpsLat: numeric("gps_lat", { precision: 10, scale: 7 }),
  gpsLng: numeric("gps_lng", { precision: 11, scale: 7 }),
  tiradaEm: timestamp("tirada_em").defaultNow(),
});

export const insertVisitaSchema = createInsertSchema(visitasTable).omit({ id: true, criadoEm: true });
export type InsertVisita = z.infer<typeof insertVisitaSchema>;
export type Visita = typeof visitasTable.$inferSelect;
