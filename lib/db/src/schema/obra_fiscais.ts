import { pgTable, serial, integer, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { obrasTable } from "./obras";
import { usuariosTable } from "./usuarios";

export const NIVEIS_FISCAL = ["principal", "auxiliar"] as const;
export type NivelFiscal = (typeof NIVEIS_FISCAL)[number];

export const obraFiscaisTable = pgTable(
  "obra_fiscais",
  {
    id: serial("id").primaryKey(),
    obraId: integer("obra_id").references(() => obrasTable.id, { onDelete: "cascade" }).notNull(),
    usuarioId: integer("usuario_id").references(() => usuariosTable.id, { onDelete: "cascade" }).notNull(),
    nivel: varchar("nivel", { length: 20 }).default("auxiliar").notNull(),
    adicionadoPor: integer("adicionado_por").references(() => usuariosTable.id),
    criadoEm: timestamp("criado_em").defaultNow().notNull(),
  },
  (t) => [unique().on(t.obraId, t.usuarioId)]
);

export type ObraFiscal = typeof obraFiscaisTable.$inferSelect;
