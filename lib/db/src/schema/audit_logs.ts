import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { usuariosTable } from "./usuarios";
import { municipiosTable } from "./municipios";
import { obrasTable } from "./obras";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  municipioId: integer("municipio_id").references(() => municipiosTable.id).notNull(),
  usuarioId: integer("usuario_id").references(() => usuariosTable.id).notNull(),
  usuarioNome: text("usuario_nome").notNull(),
  acao: varchar("acao", { length: 50 }).notNull(),
  descricao: text("descricao").notNull(),
  obraId: integer("obra_id").references(() => obrasTable.id),
  obraNome: text("obra_nome"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
