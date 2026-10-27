import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import {
  obrasTable, visitasTable, medicoesTable, naoConformidadesTable,
  analisesIATable, notificacoesTable
} from "@workspace/db";
import { eq, and, desc, count, sql, inArray } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/kpis", async (req: AuthRequest, res: Response) => {
  const municipioId = req.auth.municipioId;
  const hoje = new Date();

  const obras = await db.select().from(obrasTable).where(eq(obrasTable.municipioId, municipioId));
  const totalObras = obras.length;
  const obrasEmExecucao = obras.filter((o) => o.status === "em_execucao").length;
  const obrasConcluidas = obras.filter((o) => o.status === "concluida").length;
  const obrasParalisadas = obras.filter((o) => o.status === "paralisada").length;
  const obrasAtrasadas = obras.filter((o) => {
    if (o.status === "concluida" || o.status === "rescindida") return false;
    const fim = new Date(o.dataFimAtual ?? o.dataFimPrevista);
    return fim < hoje;
  }).length;

  const valorTotalEmExecucao = obras
    .filter((o) => o.status === "em_execucao")
    .reduce((acc, o) => acc + Number(o.valorAtual ?? o.valorContratado), 0);

  const obraIds = obras.map((o) => o.id);

  let medicoesPendentes = 0;
  let naoConformidadesAbertas = 0;
  let obrasEmRisco = 0;
  let visitasEsseMes = 0;

  if (obraIds.length > 0) {
    const mesAtual = hoje.toISOString().slice(0, 7);

    const [medicoesResp] = await db.select({ count: count() }).from(medicoesTable)
      .where(and(
        inArray(medicoesTable.obraId, obraIds),
        eq(medicoesTable.status, "aguardando_gestor")
      ));

    const [ncResp] = await db.select({ count: count() }).from(naoConformidadesTable)
      .where(and(
        inArray(naoConformidadesTable.obraId, obraIds),
        eq(naoConformidadesTable.status, "pendente")
      ));

    const analiseRows = await db.select({ obraId: analisesIATable.obraId, nivelRisco: analisesIATable.nivelRisco })
      .from(analisesIATable)
      .where(and(
        inArray(analisesIATable.obraId, obraIds),
        sql`${analisesIATable.nivelRisco} IN ('alto', 'critico')`
      ));
    const seenObras = new Set<number>();
    for (const a of analiseRows) {
      if (!seenObras.has(a.obraId)) { seenObras.add(a.obraId); obrasEmRisco++; }
    }

    const [visitasResp] = await db.select({ count: count() }).from(visitasTable)
      .where(and(
        inArray(visitasTable.obraId, obraIds),
        sql`to_char(${visitasTable.visitadoEm}, 'YYYY-MM') = ${mesAtual}`
      ));

    medicoesPendentes = Number(medicoesResp?.count ?? 0);
    naoConformidadesAbertas = Number(ncResp?.count ?? 0);
    visitasEsseMes = Number(visitasResp?.count ?? 0);
  }

  res.json({
    totalObras,
    obrasEmExecucao,
    obrasAtrasadas,
    obrasConcluidas,
    obrasParalisadas,
    valorTotalEmExecucao,
    medicoesPendentes,
    naoConformidadesAbertas,
    obrasEmRisco,
    visitasEsseMes,
  });
});

router.get("/obras-por-status", async (req: AuthRequest, res: Response) => {
  const municipioId = req.auth.municipioId;
  const obras = await db.select({ status: obrasTable.status, valorAtual: obrasTable.valorAtual, valorContratado: obrasTable.valorContratado }).from(obrasTable).where(eq(obrasTable.municipioId, municipioId));

  const labels: Record<string, string> = {
    contratada: "Contratada", em_execucao: "Em Execução", paralisada: "Paralisada",
    concluida: "Concluída", rescindida: "Rescindida",
  };

  const grouped = obras.reduce<Record<string, { count: number; valor: number }>>((acc, o) => {
    if (!acc[o.status]) acc[o.status] = { count: 0, valor: 0 };
    acc[o.status].count++;
    acc[o.status].valor += Number(o.valorAtual ?? o.valorContratado);
    return acc;
  }, {});

  res.json(Object.entries(grouped).map(([status, data]) => ({
    status, count: data.count, label: labels[status] ?? status, valor: data.valor,
  })));
});

router.get("/atividade-recente", async (req: AuthRequest, res: Response) => {
  const municipioId = req.auth.municipioId;
  const obras = await db.select({ id: obrasTable.id, nome: obrasTable.nome }).from(obrasTable).where(eq(obrasTable.municipioId, municipioId));
  const obraIds = obras.map((o) => o.id);
  const obraMap = Object.fromEntries(obras.map((o) => [o.id, o.nome]));

  if (obraIds.length === 0) { res.json([]); return; }

  const [visitas, ncs, medicoes] = await Promise.all([
    db.select({ id: visitasTable.id, obraId: visitasTable.obraId, criadoEm: visitasTable.criadoEm, percentualFisico: visitasTable.percentualFisico })
      .from(visitasTable).where(inArray(visitasTable.obraId, obraIds)).orderBy(desc(visitasTable.criadoEm)).limit(5),
    db.select({ id: naoConformidadesTable.id, obraId: naoConformidadesTable.obraId, criadoEm: naoConformidadesTable.criadoEm, severidade: naoConformidadesTable.severidade })
      .from(naoConformidadesTable).where(inArray(naoConformidadesTable.obraId, obraIds)).orderBy(desc(naoConformidadesTable.criadoEm)).limit(5),
    db.select({ id: medicoesTable.id, obraId: medicoesTable.obraId, criadoEm: medicoesTable.criadoEm, status: medicoesTable.status })
      .from(medicoesTable).where(inArray(medicoesTable.obraId, obraIds)).orderBy(desc(medicoesTable.criadoEm)).limit(5),
  ]);

  const events = [
    ...visitas.map((v) => ({ id: `visita-${v.id}`, tipo: "visita", descricao: `Nova visita registrada com ${Number(v.percentualFisico)}% de avanço`, data: v.criadoEm.toISOString(), obraId: v.obraId, obraNome: obraMap[v.obraId] ?? null, autor: null })),
    ...ncs.map((nc) => ({ id: `nc-${nc.id}`, tipo: "nao_conformidade", descricao: `Não conformidade ${nc.severidade} registrada`, data: nc.criadoEm.toISOString(), obraId: nc.obraId, obraNome: obraMap[nc.obraId] ?? null, autor: null })),
    ...medicoes.map((m) => ({ id: `medicao-${m.id}`, tipo: "medicao" as const, descricao: `Boletim de medição: status: ${m.status.replace(/_/g, " ")}`, data: m.criadoEm.toISOString(), obraId: m.obraId, obraNome: obraMap[m.obraId] ?? null, autor: null })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 10);

  res.json(events);
});

router.get("/obras-em-risco", async (req: AuthRequest, res: Response) => {
  const municipioId = req.auth.municipioId;
  const obras = await db.select().from(obrasTable).where(eq(obrasTable.municipioId, municipioId));
  const obraIds = obras.map((o) => o.id);
  if (obraIds.length === 0) { res.json([]); return; }

  const analises = await db
    .select({ obraId: analisesIATable.obraId, nivelRisco: analisesIATable.nivelRisco, analiseTexto: analisesIATable.analiseTexto, criadoEm: analisesIATable.criadoEm })
    .from(analisesIATable)
    .where(and(
      inArray(analisesIATable.obraId, obraIds),
      sql`${analisesIATable.nivelRisco} IN ('alto', 'critico')`
    ))
    .orderBy(desc(analisesIATable.criadoEm));

  const latestByObra = new Map<number, typeof analises[0]>();
  for (const a of analises) {
    if (!latestByObra.has(a.obraId)) latestByObra.set(a.obraId, a);
  }

  const result = [];
  for (const [obraId, analise] of latestByObra) {
    const obra = obras.find((o) => o.id === obraId);
    if (!obra) continue;
    const [ncCount] = await db.select({ count: count() }).from(naoConformidadesTable)
      .where(and(eq(naoConformidadesTable.obraId, obraId), eq(naoConformidadesTable.status, "pendente")));
    result.push({
      id: obraId,
      nome: obra.nome,
      nivelRisco: analise.nivelRisco,
      motivoRisco: analise.analiseTexto.slice(0, 120) + "...",
      percentualAtraso: null,
      totalNaoConformidades: Number(ncCount?.count ?? 0),
    });
  }

  res.json(result);
});

export default router;
