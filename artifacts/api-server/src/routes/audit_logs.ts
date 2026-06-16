import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import type { AuthPayload } from "../middlewares/auth";
import type { Request, Response } from "express";

const router = Router();
type AuthReq = Request & { auth: AuthPayload };

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const { auth } = req as AuthReq;

  const usuarioIdParam = req.query.usuarioId ? Number(req.query.usuarioId) : null;
  const obraIdParam = req.query.obraId ? Number(req.query.obraId) : null;
  const acaoParam = req.query.acao as string | undefined;
  const dataInicio = req.query.dataInicio as string | undefined;
  const dataFim = req.query.dataFim as string | undefined;

  const conditions = [eq(auditLogsTable.municipioId, auth.municipioId)];

  // Fiscais and engenheiros only see their own logs
  if (auth.perfil === "fiscal" || auth.perfil === "engenheiro") {
    conditions.push(eq(auditLogsTable.usuarioId, auth.userId));
  } else if (usuarioIdParam) {
    conditions.push(eq(auditLogsTable.usuarioId, usuarioIdParam));
  }

  if (obraIdParam) {
    conditions.push(eq(auditLogsTable.obraId, obraIdParam));
  }

  if (acaoParam) {
    conditions.push(eq(auditLogsTable.acao, acaoParam));
  }

  if (dataInicio) {
    conditions.push(gte(auditLogsTable.criadoEm, new Date(dataInicio)));
  }

  if (dataFim) {
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    conditions.push(lte(auditLogsTable.criadoEm, fim));
  }

  const logs = await db
    .select()
    .from(auditLogsTable)
    .where(and(...conditions))
    .orderBy(desc(auditLogsTable.criadoEm))
    .limit(200);

  res.json(logs);
});

export default router;
