import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { notificacoesTable, obrasTable } from "@workspace/db";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { CreateNotificacaoBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const { obraId, status } = req.query as Record<string, string>;

  const notifs = await db
    .select({
      id: notificacoesTable.id,
      obraId: notificacoesTable.obraId,
      obraNome: obrasTable.nome,
      tipo: notificacoesTable.tipo,
      status: notificacoesTable.status,
      descricao: notificacoesTable.descricao,
      enviadoEm: notificacoesTable.enviadoEm,
      prazoResposta: notificacoesTable.prazoResposta,
      textoResposta: notificacoesTable.textoResposta,
      numeroSequencial: notificacoesTable.numeroSequencial,
    })
    .from(notificacoesTable)
    .leftJoin(obrasTable, eq(obrasTable.id, notificacoesTable.obraId))
    .where(eq(obrasTable.municipioId, req.auth.municipioId))
    .orderBy(desc(notificacoesTable.enviadoEm));

  let result = notifs.map((n) => ({ ...n, enviadoEm: n.enviadoEm.toISOString() }));
  if (obraId) result = result.filter((n) => n.obraId === Number(obraId));
  if (status) result = result.filter((n) => n.status === status);

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateNotificacaoBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [countResult] = await db.select({ count: count() }).from(notificacoesTable).where(eq(notificacoesTable.obraId, parse.data.obraId));
  const numeroSequencial = Number(countResult?.count ?? 0) + 1;

  const prazoResposta = parse.data.prazoRespostaDias
    ? new Date(Date.now() + parse.data.prazoRespostaDias * 24 * 3600 * 1000).toISOString().slice(0, 10)
    : null;

  const [notif] = await db
    .insert(notificacoesTable)
    .values({
      obraId: parse.data.obraId,
      tipo: parse.data.tipo,
      descricao: parse.data.descricao,
      prazoResposta,
      numeroSequencial,
    })
    .returning();

  res.status(201).json({ ...notif, obraNome: null, enviadoEm: notif.enviadoEm.toISOString() });
});

export default router;
