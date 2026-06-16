import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import {
  obrasTable, visitasTable, naoConformidadesTable, aditivosTable, analisesIATable,
  medicoesTable, notificacoesTable, documentosTable, fotosVisitaTable
} from "@workspace/db";
import { eq, and, ilike, sql, desc, count } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import {
  CreateObraBody, UpdateObraBody, UpdateObraParams, GetObraParams,
  DeleteObraParams, GetObraTimelineParams, GetObraCurvaSParams,
  ListAditivosParams, CreateAditivoBody, CreateAditivoParams
} from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

type AuthRequest = Request & { auth: AuthPayload };

router.get("/", async (req: AuthRequest, res: Response) => {
  const { status, tipo, search } = req.query as Record<string, string>;
  const municipioId = req.auth.municipioId;

  let obras = await db
    .select({
      id: obrasTable.id,
      municipioId: obrasTable.municipioId,
      nome: obrasTable.nome,
      descricao: obrasTable.descricao,
      tipo: obrasTable.tipo,
      status: obrasTable.status,
      valorContratado: obrasTable.valorContratado,
      valorAtual: obrasTable.valorAtual,
      dataInicio: obrasTable.dataInicio,
      dataFimPrevista: obrasTable.dataFimPrevista,
      dataFimAtual: obrasTable.dataFimAtual,
      empresaContratada: obrasTable.empresaContratada,
      cnpjEmpresa: obrasTable.cnpjEmpresa,
      numeroContrato: obrasTable.numeroContrato,
      fonteRecursos: obrasTable.fonteRecursos,
      logradouro: obrasTable.logradouro,
      bairro: obrasTable.bairro,
      latitude: obrasTable.latitude,
      longitude: obrasTable.longitude,
      percentualFisicoAtual: obrasTable.percentualFisicoAtual,
      responsavelTecnico: obrasTable.responsavelTecnico,
      criadoEm: obrasTable.criadoEm,
      atualizadoEm: obrasTable.atualizadoEm,
    })
    .from(obrasTable)
    .where(eq(obrasTable.municipioId, municipioId))
    .orderBy(desc(obrasTable.criadoEm));

  if (status) obras = obras.filter((o) => o.status === status);
  if (tipo) obras = obras.filter((o) => o.tipo === tipo);
  if (search) obras = obras.filter((o) => o.nome.toLowerCase().includes(search.toLowerCase()));

  const result = await Promise.all(
    obras.map(async (obra) => {
      const [totalVisitas] = await db
        .select({ count: count() })
        .from(visitasTable)
        .where(eq(visitasTable.obraId, obra.id));
      const [totalNC] = await db
        .select({ count: count() })
        .from(naoConformidadesTable)
        .where(and(eq(naoConformidadesTable.obraId, obra.id), eq(naoConformidadesTable.status, "pendente")));
      const [analise] = await db
        .select({ nivelRisco: analisesIATable.nivelRisco })
        .from(analisesIATable)
        .where(eq(analisesIATable.obraId, obra.id))
        .orderBy(desc(analisesIATable.criadoEm))
        .limit(1);

      return {
        ...obra,
        valorContratado: Number(obra.valorContratado),
        valorAtual: obra.valorAtual ? Number(obra.valorAtual) : Number(obra.valorContratado),
        percentualFisicoAtual: Number(obra.percentualFisicoAtual),
        latitude: obra.latitude ? Number(obra.latitude) : null,
        longitude: obra.longitude ? Number(obra.longitude) : null,
        criadoEm: obra.criadoEm.toISOString(),
        atualizadoEm: obra.atualizadoEm.toISOString(),
        totalVisitas: Number(totalVisitas?.count ?? 0),
        totalNaoConformidades: Number(totalNC?.count ?? 0),
        nivelRisco: analise?.nivelRisco ?? null,
      };
    })
  );

  res.json(result);
});

router.post("/", async (req: AuthRequest, res: Response) => {
  const parse = CreateObraBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Dados inválidos", details: parse.error.issues });
    return;
  }
  const data = parse.data;
  const [obra] = await db
    .insert(obrasTable)
    .values({
      municipioId: req.auth.municipioId,
      nome: data.nome,
      descricao: data.descricao ?? null,
      tipo: data.tipo,
      status: data.status ?? "contratada",
      valorContratado: String(data.valorContratado),
      valorAtual: String(data.valorContratado),
      dataInicio: data.dataInicio,
      dataFimPrevista: data.dataFimPrevista,
      empresaContratada: data.empresaContratada,
      cnpjEmpresa: data.cnpjEmpresa ?? null,
      numeroContrato: data.numeroContrato ?? null,
      fonteRecursos: data.fonteRecursos ?? null,
      logradouro: data.logradouro ?? null,
      bairro: data.bairro ?? null,
      latitude: data.latitude ? String(data.latitude) : null,
      longitude: data.longitude ? String(data.longitude) : null,
      responsavelTecnico: data.responsavelTecnico ?? null,
    })
    .returning();

  res.status(201).json({
    ...obra,
    valorContratado: Number(obra.valorContratado),
    valorAtual: Number(obra.valorAtual ?? obra.valorContratado),
    percentualFisicoAtual: Number(obra.percentualFisicoAtual ?? 0),
    latitude: obra.latitude ? Number(obra.latitude) : null,
    longitude: obra.longitude ? Number(obra.longitude) : null,
    criadoEm: obra.criadoEm.toISOString(),
    atualizadoEm: obra.atualizadoEm.toISOString(),
    totalVisitas: 0,
    totalNaoConformidades: 0,
    nivelRisco: null,
  });
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const parse = GetObraParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [obra] = await db
    .select()
    .from(obrasTable)
    .where(and(eq(obrasTable.id, parse.data.id), eq(obrasTable.municipioId, req.auth.municipioId)))
    .limit(1);
  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  const [totalVisitas] = await db.select({ count: count() }).from(visitasTable).where(eq(visitasTable.obraId, obra.id));
  const [totalNC] = await db.select({ count: count() }).from(naoConformidadesTable).where(and(eq(naoConformidadesTable.obraId, obra.id), eq(naoConformidadesTable.status, "pendente")));
  const [analise] = await db.select({ nivelRisco: analisesIATable.nivelRisco }).from(analisesIATable).where(eq(analisesIATable.obraId, obra.id)).orderBy(desc(analisesIATable.criadoEm)).limit(1);

  res.json({
    ...obra,
    valorContratado: Number(obra.valorContratado),
    valorAtual: obra.valorAtual ? Number(obra.valorAtual) : Number(obra.valorContratado),
    percentualFisicoAtual: Number(obra.percentualFisicoAtual ?? 0),
    latitude: obra.latitude ? Number(obra.latitude) : null,
    longitude: obra.longitude ? Number(obra.longitude) : null,
    criadoEm: obra.criadoEm.toISOString(),
    atualizadoEm: obra.atualizadoEm.toISOString(),
    totalVisitas: Number(totalVisitas?.count ?? 0),
    totalNaoConformidades: Number(totalNC?.count ?? 0),
    nivelRisco: analise?.nivelRisco ?? null,
  });
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const idParse = UpdateObraParams.safeParse({ id: Number(req.params.id) });
  if (!idParse.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parse = UpdateObraBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const updates: Record<string, unknown> = { atualizadoEm: new Date() };
  const d = parse.data;
  if (d.nome !== undefined) updates.nome = d.nome;
  if (d.descricao !== undefined) updates.descricao = d.descricao;
  if (d.status !== undefined) updates.status = d.status;
  if (d.percentualFisicoAtual !== undefined) updates.percentualFisicoAtual = String(d.percentualFisicoAtual);
  if (d.dataFimAtual !== undefined) updates.dataFimAtual = d.dataFimAtual;
  if (d.responsavelTecnico !== undefined) updates.responsavelTecnico = d.responsavelTecnico;

  const [obra] = await db
    .update(obrasTable)
    .set(updates)
    .where(and(eq(obrasTable.id, idParse.data.id), eq(obrasTable.municipioId, req.auth.municipioId)))
    .returning();

  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  res.json({
    ...obra,
    valorContratado: Number(obra.valorContratado),
    valorAtual: obra.valorAtual ? Number(obra.valorAtual) : Number(obra.valorContratado),
    percentualFisicoAtual: Number(obra.percentualFisicoAtual ?? 0),
    latitude: obra.latitude ? Number(obra.latitude) : null,
    longitude: obra.longitude ? Number(obra.longitude) : null,
    criadoEm: obra.criadoEm.toISOString(),
    atualizadoEm: obra.atualizadoEm.toISOString(),
    totalVisitas: null, totalNaoConformidades: null, nivelRisco: null,
  });
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const parse = DeleteObraParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }
  await db.delete(obrasTable).where(and(eq(obrasTable.id, parse.data.id), eq(obrasTable.municipioId, req.auth.municipioId)));
  res.status(204).end();
});

router.get("/:id/timeline", async (req: AuthRequest, res: Response) => {
  const parse = GetObraTimelineParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const obraId = parse.data.id;

  const visitas = await db.select({ id: visitasTable.id, visitadoEm: visitasTable.visitadoEm, percentualFisico: visitasTable.percentualFisico }).from(visitasTable).where(eq(visitasTable.obraId, obraId)).orderBy(desc(visitasTable.visitadoEm));
  const medicoes = await db.select({ id: medicoesTable.id, criadoEm: medicoesTable.criadoEm, valorTotal: medicoesTable.valorTotal, status: medicoesTable.status }).from(medicoesTable).where(eq(medicoesTable.obraId, obraId)).orderBy(desc(medicoesTable.criadoEm));
  const aditivos = await db.select({ id: aditivosTable.id, criadoEm: aditivosTable.criadoEm, tipo: aditivosTable.tipo, numeroAditivo: aditivosTable.numeroAditivo }).from(aditivosTable).where(eq(aditivosTable.obraId, obraId)).orderBy(desc(aditivosTable.criadoEm));
  const notificacoes = await db.select({ id: notificacoesTable.id, enviadoEm: notificacoesTable.enviadoEm, tipo: notificacoesTable.tipo }).from(notificacoesTable).where(eq(notificacoesTable.obraId, obraId)).orderBy(desc(notificacoesTable.enviadoEm));

  const events = [
    ...visitas.map((v) => ({ id: `visita-${v.id}`, tipo: "visita" as const, descricao: `Visita registrada — ${Number(v.percentualFisico)}% de avanço físico`, data: v.visitadoEm.toISOString(), autor: null, metadata: {} })),
    ...medicoes.map((m) => ({ id: `medicao-${m.id}`, tipo: "medicao" as const, descricao: `Boletim de medição — R$ ${Number(m.valorTotal).toLocaleString("pt-BR")} (${m.status})`, data: m.criadoEm.toISOString(), autor: null, metadata: {} })),
    ...aditivos.map((a) => ({ id: `aditivo-${a.id}`, tipo: "aditivo" as const, descricao: `Aditivo nº ${a.numeroAditivo} (${a.tipo})`, data: a.criadoEm.toISOString(), autor: null, metadata: {} })),
    ...notificacoes.map((n) => ({ id: `notificacao-${n.id}`, tipo: "notificacao" as const, descricao: `Notificação formal — ${n.tipo.replace(/_/g, " ")}`, data: n.enviadoEm.toISOString(), autor: null, metadata: {} })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  res.json(events);
});

router.get("/:id/curva-s", async (req: AuthRequest, res: Response) => {
  const parse = GetObraCurvaSParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [obra] = await db.select({ dataInicio: obrasTable.dataInicio, dataFimPrevista: obrasTable.dataFimPrevista, valorContratado: obrasTable.valorContratado }).from(obrasTable).where(eq(obrasTable.id, parse.data.id)).limit(1);
  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  const visitas = await db.select({ visitadoEm: visitasTable.visitadoEm, percentualFisico: visitasTable.percentualFisico }).from(visitasTable).where(eq(visitasTable.obraId, parse.data.id)).orderBy(visitasTable.visitadoEm);

  const inicio = new Date(obra.dataInicio);
  const fim = new Date(obra.dataFimPrevista);
  const meses: { mes: string; planejado: number; realizado: number; valorPlanejado: number; valorRealizado: number }[] = [];
  const valorTotal = Number(obra.valorContratado);

  let cursor = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
  const total = Math.max(1, Math.round((fim.getTime() - inicio.getTime()) / (30 * 24 * 3600 * 1000)));
  let m = 0;

  while (cursor <= fim && m < 24) {
    const mes = cursor.toISOString().slice(0, 7);
    const planejado = Math.min(100, Math.round(((m + 1) / total) * 100));

    const visitasMes = visitas.filter((v) => v.visitadoEm.toISOString().slice(0, 7) === mes);
    const realizado = visitasMes.length > 0 ? Math.max(...visitasMes.map((v) => Number(v.percentualFisico))) : (meses.length > 0 ? meses[meses.length - 1].realizado : 0);

    meses.push({ mes, planejado, realizado, valorPlanejado: (planejado / 100) * valorTotal, valorRealizado: (realizado / 100) * valorTotal });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    m++;
  }

  res.json(meses);
});

// Aditivos
router.get("/:id/aditivos", async (req: AuthRequest, res: Response) => {
  const parse = ListAditivosParams.safeParse({ id: Number(req.params.id) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const aditivos = await db
    .select()
    .from(aditivosTable)
    .where(eq(aditivosTable.obraId, parse.data.id))
    .orderBy(desc(aditivosTable.criadoEm));

  res.json(aditivos.map((a) => ({
    ...a,
    valorAcrescimo: a.valorAcrescimo ? Number(a.valorAcrescimo) : null,
    percentualAcrescimo: a.percentualAcrescimo ? Number(a.percentualAcrescimo) : null,
    criadoEm: a.criadoEm.toISOString(),
  })));
});

router.post("/:id/aditivos", async (req: AuthRequest, res: Response) => {
  const idParse = CreateAditivoParams.safeParse({ id: Number(req.params.id) });
  if (!idParse.success) { res.status(400).json({ error: "ID inválido" }); return; }
  const parse = CreateAditivoBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const [obra] = await db.select({ valorContratado: obrasTable.valorContratado }).from(obrasTable).where(eq(obrasTable.id, idParse.data.id)).limit(1);
  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  const percentualAcrescimo = parse.data.valorAcrescimo
    ? ((parse.data.valorAcrescimo / Number(obra.valorContratado)) * 100).toFixed(2)
    : null;

  const [aditivo] = await db
    .insert(aditivosTable)
    .values({
      obraId: idParse.data.id,
      tipo: parse.data.tipo,
      numeroAditivo: parse.data.numeroAditivo,
      justificativa: parse.data.justificativa,
      dataAssinatura: parse.data.dataAssinatura,
      valorAcrescimo: parse.data.valorAcrescimo ? String(parse.data.valorAcrescimo) : null,
      diasAcrescimo: parse.data.diasAcrescimo ?? null,
      percentualAcrescimo,
    })
    .returning();

  if (parse.data.valorAcrescimo) {
    await db.update(obrasTable).set({ valorAtual: String(Number(obra.valorContratado) + parse.data.valorAcrescimo) }).where(eq(obrasTable.id, idParse.data.id));
  }

  res.status(201).json({
    ...aditivo,
    valorAcrescimo: aditivo.valorAcrescimo ? Number(aditivo.valorAcrescimo) : null,
    percentualAcrescimo: aditivo.percentualAcrescimo ? Number(aditivo.percentualAcrescimo) : null,
    criadoEm: aditivo.criadoEm.toISOString(),
  });
});

export default router;
