import { pgTable, text, serial, integer, timestamp, boolean, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { obrasTable } from "./obras";

export const documentosTable = pgTable("documentos", {
  id: serial("id").primaryKey(),
  obraId: integer("obra_id").references(() => obrasTable.id).notNull(),
  categoria: varchar("categoria", { length: 40 }).notNull(),
  nome: text("nome").notNull(),
  fileUrl: text("file_url").notNull(),
  versao: integer("versao").default(1),
  assinado: boolean("assinado").default(false),
  expiracaoEm: date("expiracao_em"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertDocumentoSchema = createInsertSchema(documentosTable).omit({ id: true, criadoEm: true });
export type InsertDocumento = z.infer<typeof insertDocumentoSchema>;
export type Documento = typeof documentosTable.$inferSelect;
