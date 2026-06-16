import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { municipiosTable } from "./municipios";

export const PERFIS = ["administrador", "gestor", "fiscal", "engenheiro", "auditor", "cidadao"] as const;
export type Perfil = (typeof PERFIS)[number];

export const usuariosTable = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  municipioId: integer("municipio_id").references(() => municipiosTable.id).notNull(),
  nome: text("nome").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  senhaHash: text("senha_hash").notNull(),
  perfil: varchar("perfil", { length: 20 }).default("fiscal").notNull(),
  avatar: text("avatar"),
  ativo: text("ativo").default("true"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export const insertUsuarioSchema = createInsertSchema(usuariosTable).omit({ id: true, criadoEm: true });
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuariosTable.$inferSelect;
