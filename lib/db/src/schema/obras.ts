import { pgTable, text, serial, integer, timestamp, numeric, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { municipiosTable } from "./municipios";

export const TIPOS_OBRA = ["pavimentacao", "edificacao", "saneamento", "iluminacao", "pontes", "outros"] as const;
export const STATUS_OBRA = ["contratada", "em_execucao", "paralisada", "concluida", "rescindida"] as const;

export const obrasTable = pgTable("obras", {
  id: serial("id").primaryKey(),
  municipioId: integer("municipio_id").references(() => municipiosTable.id).notNull(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  tipo: varchar("tipo", { length: 30 }).notNull(),
  status: varchar("status", { length: 30 }).default("contratada").notNull(),
  valorContratado: numeric("valor_contratado", { precision: 15, scale: 2 }).notNull(),
  valorAtual: numeric("valor_atual", { precision: 15, scale: 2 }),
  dataInicio: date("data_inicio").notNull(),
  dataFimPrevista: date("data_fim_prevista").notNull(),
  dataFimAtual: date("data_fim_atual"),
  empresaContratada: text("empresa_contratada").notNull(),
  cnpjEmpresa: varchar("cnpj_empresa", { length: 18 }),
  numeroContrato: varchar("numero_contrato", { length: 100 }),
  fonteRecursos: text("fonte_recursos"),
  logradouro: text("logradouro"),
  bairro: text("bairro"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 11, scale: 7 }),
  percentualFisicoAtual: numeric("percentual_fisico_atual", { precision: 5, scale: 2 }).default("0"),
  responsavelTecnico: text("responsavel_tecnico"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

export const insertObraSchema = createInsertSchema(obrasTable).omit({ id: true, criadoEm: true, atualizadoEm: true });
export type InsertObra = z.infer<typeof insertObraSchema>;
export type Obra = typeof obrasTable.$inferSelect;
