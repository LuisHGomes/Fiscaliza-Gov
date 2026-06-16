import { db } from "@workspace/db";
import { auditLogsTable, obrasTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthPayload } from "../middlewares/auth";

export interface AuditParams {
  auth: AuthPayload;
  usuarioNome: string;
  acao: string;
  descricao: string;
  obraId?: number;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    let obraNome: string | null = null;
    if (params.obraId) {
      const [obra] = await db
        .select({ nome: obrasTable.nome })
        .from(obrasTable)
        .where(eq(obrasTable.id, params.obraId))
        .limit(1);
      obraNome = obra?.nome ?? null;
    }

    await db.insert(auditLogsTable).values({
      municipioId: params.auth.municipioId,
      usuarioId: params.auth.userId,
      usuarioNome: params.usuarioNome,
      acao: params.acao,
      descricao: params.descricao,
      obraId: params.obraId ?? null,
      obraNome,
    });
  } catch {
    // Audit logging must not break the main flow
  }
}
