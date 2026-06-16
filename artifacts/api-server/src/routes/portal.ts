import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { obrasTable, municipiosTable, fotosVisitaTable, visitasTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { ListObrasPublicasQueryParams, GetObraPublicaParams } from "@workspace/api-zod";

const router = Router();

const DEMO_MUNICIPIO_ID = 1;

router.get("/obras", async (req: Request, res: Response) => {
  const parse = ListObrasPublicasQueryParams.safeParse(req.query);
  const { status, tipo, search } = parse.success ? parse.data : {} as Record<string, string | undefined>;

  let obras = await db
    .select({
      id: obrasTable.id,
      nome: obrasTable.nome,
      descricao: obrasTable.descricao,
      tipo: obrasTable.tipo,
      status: obrasTable.status,
      valorContratado: obrasTable.valorContratado,
      valorAtual: obrasTable.valorAtual,
      empresaContratada: obrasTable.empresaContratada,
      dataInicio: obrasTable.dataInicio,
      dataFimPrevista: obrasTable.dataFimPrevista,
      percentualFisicoAtual: obrasTable.percentualFisicoAtual,
      logradouro: obrasTable.logradouro,
      bairro: obrasTable.bairro,
      latitude: obrasTable.latitude,
      longitude: obrasTable.longitude,
      atualizadoEm: obrasTable.atualizadoEm,
    })
    .from(obrasTable)
    .where(eq(obrasTable.municipioId, DEMO_MUNICIPIO_ID))
    .orderBy(desc(obrasTable.atualizadoEm));

  if (status) obras = obras.filter((o) => o.status === status);
  if (tipo) obras = obras.filter((o) => o.tipo === tipo);
  if (search) obras = obras.filter((o) => o.nome.toLowerCase().includes((search as string).toLowerCase()));

  const result = obras.map((o) => ({
    id: o.id,
    nome: o.nome,
    descricao: o.descricao ?? null,
    tipo: o.tipo,
    status: o.status,
    valorContratado: Number(o.valorContratado),
    valorAtual: Number(o.valorAtual ?? o.valorContratado),
    empresaContratada: o.empresaContratada,
    dataInicio: o.dataInicio,
    dataFimPrevista: o.dataFimPrevista,
    percentualFisicoAtual: Number(o.percentualFisicoAtual ?? 0),
    logradouro: o.logradouro ?? null,
    bairro: o.bairro ?? null,
    latitude: o.latitude ? Number(o.latitude) : null,
    longitude: o.longitude ? Number(o.longitude) : null,
    fotos: [],
    ultimaAtualizacao: o.atualizadoEm?.toISOString() ?? null,
  }));

  res.json(result);
});

router.get("/totalizadores", async (_req: Request, res: Response) => {
  const obras = await db.select().from(obrasTable).where(eq(obrasTable.municipioId, DEMO_MUNICIPIO_ID));
  const [municipio] = await db.select({ nome: municipiosTable.nome }).from(municipiosTable).where(eq(municipiosTable.id, DEMO_MUNICIPIO_ID)).limit(1);

  const totalObras = obras.length;
  const obrasEmExecucao = obras.filter((o) => o.status === "em_execucao").length;
  const obrasConcluidas = obras.filter((o) => o.status === "concluida").length;
  const valorTotalInvestido = obras.reduce((acc, o) => acc + Number(o.valorAtual ?? o.valorContratado), 0);

  res.json({
    totalObras,
    obrasEmExecucao,
    obrasConcluidas,
    valorTotalInvestido,
    municipio: municipio?.nome ?? "Município de Demonstração",
  });
});

router.get("/obras/:id", async (req: Request, res: Response) => {
  const parse = GetObraPublicaParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [obra] = await db
    .select()
    .from(obrasTable)
    .where(and(eq(obrasTable.id, parse.data.id), eq(obrasTable.municipioId, DEMO_MUNICIPIO_ID)))
    .limit(1);

  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  res.json({
    id: obra.id,
    nome: obra.nome,
    descricao: obra.descricao ?? null,
    tipo: obra.tipo,
    status: obra.status,
    valorContratado: Number(obra.valorContratado),
    valorAtual: Number(obra.valorAtual ?? obra.valorContratado),
    empresaContratada: obra.empresaContratada,
    dataInicio: obra.dataInicio,
    dataFimPrevista: obra.dataFimPrevista,
    percentualFisicoAtual: Number(obra.percentualFisicoAtual ?? 0),
    logradouro: obra.logradouro ?? null,
    bairro: obra.bairro ?? null,
    latitude: obra.latitude ? Number(obra.latitude) : null,
    longitude: obra.longitude ? Number(obra.longitude) : null,
    fotos: [],
    ultimaAtualizacao: obra.atualizadoEm?.toISOString() ?? null,
  });
});

export default router;
