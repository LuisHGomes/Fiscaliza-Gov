import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { naoConformidadesTable, obrasTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { CreateNaoConformidadeBody, ResolverNaoConformidadeParams, ResolverNaoConformidadeBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const { obraId, status, severidade } = req.query as Record<string, string>;

  const ncs = await db
    .select({
      id: naoConformidadesTable.id,
      visitaId: naoConformidadesTable.visitaId,
      obraId: naoConformidadesTable.obraId,
      obraNome: obrasTable.nome,
      severidade: naoConformidadesTable.severidade,
      descricao: naoConformidadesTable.descricao,
      prazoCorrecaoDias: naoConformidadesTable.prazoCorrecaoDias,
      status: naoConformidadesTable.status,
      resolvidaEm: naoConformidadesTable.resolvidaEm,
      resolucaoDescricao: naoConformidadesTable.resolucaoDescricao,
      criadoEm: naoConformidadesTable.criadoEm,
    })
    .from(naoConformidadesTable)
    .leftJoin(obrasTable, eq(obrasTable.id, naoConformidadesTable.obraId))
    .where(eq(obrasTable.municipioId, req.auth.municipioId))
    .orderBy(desc(naoConformidadesTable.criadoEm));

  let result = ncs.map((nc) => ({
    ...nc,
    resolvidaEm: nc.resolvidaEm?.toISOString() ?? null,
    criadoEm: nc.criadoEm.toISOString(),
  }));

  if (obraId) result = result.filter((nc) => nc.obraId === Number(obraId));
  if (status) result = result.filter((nc) => nc.status === status);
  if (severidade) result = result.filter((nc) => nc.severidade === severidade);

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateNaoConformidadeBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [nc] = await db
    .insert(naoConformidadesTable)
    .values({
      visitaId: parse.data.visitaId,
      obraId: parse.data.obraId,
      severidade: parse.data.severidade,
      descricao: parse.data.descricao,
      prazoCorrecaoDias: parse.data.prazoCorrecaoDias ?? null,
    })
    .returning();

  res.status(201).json({ ...nc, resolvidaEm: null, criadoEm: nc.criadoEm.toISOString(), obraNome: null });
});

router.patch("/:id/resolver", async (req: AuthRequest, res: Response) => {
  const idParse = ResolverNaoConformidadeParams.safeParse({ id: Number(req.params.id) });
  if (!idParse.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parse = ResolverNaoConformidadeBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [nc] = await db
    .update(naoConformidadesTable)
    .set({ status: "resolvida", resolvidaEm: new Date(), resolucaoDescricao: parse.data.resolucaoDescricao })
    .where(eq(naoConformidadesTable.id, idParse.data.id))
    .returning();

  if (!nc) { res.status(404).json({ error: "Não conformidade não encontrada" }); return; }

  res.json({ ...nc, resolvidaEm: nc.resolvidaEm?.toISOString() ?? null, criadoEm: nc.criadoEm.toISOString(), obraNome: null });
});

export default router;
