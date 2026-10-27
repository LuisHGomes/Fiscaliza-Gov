import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { medicoesTable, obrasTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { CreateMedicaoBody, AprovarMedicaoParams } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const { obraId, status } = req.query as Record<string, string>;

  const medicoes = await db
    .select({
      id: medicoesTable.id,
      obraId: medicoesTable.obraId,
      obraNome: obrasTable.nome,
      periodoInicio: medicoesTable.periodoInicio,
      periodoFim: medicoesTable.periodoFim,
      valorTotal: medicoesTable.valorTotal,
      valorAcumulado: medicoesTable.valorAcumulado,
      status: medicoesTable.status,
      aprovadoPor: medicoesTable.aprovadoPor,
      aprovadoEm: medicoesTable.aprovadoEm,
      observacoes: medicoesTable.observacoes,
      criadoEm: medicoesTable.criadoEm,
    })
    .from(medicoesTable)
    .leftJoin(obrasTable, eq(obrasTable.id, medicoesTable.obraId))
    .where(eq(obrasTable.municipioId, req.auth.municipioId))
    .orderBy(desc(medicoesTable.criadoEm));

  let result = medicoes.map((m) => ({
    ...m,
    valorTotal: Number(m.valorTotal),
    valorAcumulado: Number(m.valorAcumulado ?? 0),
    aprovadoEm: m.aprovadoEm?.toISOString() ?? null,
    criadoEm: m.criadoEm.toISOString(),
  }));

  if (obraId) result = result.filter((m) => m.obraId === Number(obraId));
  if (status) result = result.filter((m) => m.status === status);

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateMedicaoBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [medicao] = await db
    .insert(medicoesTable)
    .values({
      obraId: parse.data.obraId,
      periodoInicio: parse.data.periodoInicio.toISOString(),
      periodoFim: parse.data.periodoFim.toISOString(),
      valorTotal: String(parse.data.valorTotal),
      observacoes: parse.data.observacoes ?? null,
    })
    .returning();

  res.status(201).json({
    ...medicao,
    obraNome: null,
    valorTotal: Number(medicao.valorTotal),
    valorAcumulado: Number(medicao.valorAcumulado ?? 0),
    aprovadoEm: null,
    criadoEm: medicao.criadoEm.toISOString(),
  });
});

router.patch("/:id/aprovar", async (req: AuthRequest, res: Response) => {
  const parse = AprovarMedicaoParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const nextStatus: Record<string, string> = {
    rascunho: "aguardando_engenheiro",
    aguardando_engenheiro: "aguardando_gestor",
    aguardando_gestor: "aprovada",
    aprovada: "paga",
  };

  const [current] = await db.select({ status: medicoesTable.status }).from(medicoesTable).where(eq(medicoesTable.id, parse.data.id)).limit(1);
  if (!current) { res.status(404).json({ error: "Medição não encontrada" }); return; }

  const novoStatus = nextStatus[current.status] ?? "aprovada";

  const [medicao] = await db
    .update(medicoesTable)
    .set({ status: novoStatus, aprovadoPor: req.auth.userId, aprovadoEm: new Date() })
    .where(eq(medicoesTable.id, parse.data.id))
    .returning();

  res.json({
    ...medicao,
    obraNome: null,
    valorTotal: Number(medicao.valorTotal),
    valorAcumulado: Number(medicao.valorAcumulado ?? 0),
    aprovadoEm: medicao.aprovadoEm?.toISOString() ?? null,
    criadoEm: medicao.criadoEm.toISOString(),
  });
});

export default router;
