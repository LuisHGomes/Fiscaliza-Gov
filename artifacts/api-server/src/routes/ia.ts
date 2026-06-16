import { Router, Request, Response } from "express";
import { db } from "@workspace/db";
import { analisesIATable, obrasTable, visitasTable, naoConformidadesTable, medicoesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthPayload } from "../middlewares/auth";
import { GetAnaliseIAParams, GerarRelatorioIAParams, ChatAssistenteBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);
type AuthRequest = Request & { auth: AuthPayload };

router.get("/analise/:obraId", async (req: AuthRequest, res: Response) => {
  const parse = GetAnaliseIAParams.safeParse({ obraId: Number(req.params.obraId) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [analise] = await db
    .select()
    .from(analisesIATable)
    .where(eq(analisesIATable.obraId, parse.data.obraId))
    .orderBy(desc(analisesIATable.criadoEm))
    .limit(1);

  if (!analise) {
    res.status(404).json({ error: "Análise não encontrada" });
    return;
  }

  res.json({ ...analise, criadoEm: analise.criadoEm.toISOString() });
});

router.post("/relatorio/:obraId", async (req: AuthRequest, res: Response) => {
  const parse = GerarRelatorioIAParams.safeParse({ obraId: Number(req.params.obraId) });
  if (!parse.success) { res.status(400).json({ error: "ID inválido" }); return; }

  const [obra] = await db.select().from(obrasTable).where(eq(obrasTable.id, parse.data.obraId)).limit(1);
  if (!obra) { res.status(404).json({ error: "Obra não encontrada" }); return; }

  const visitas = await db.select({ id: visitasTable.id, visitadoEm: visitasTable.visitadoEm, percentualFisico: visitasTable.percentualFisico, observacoes: visitasTable.observacoes }).from(visitasTable).where(eq(visitasTable.obraId, parse.data.obraId)).orderBy(desc(visitasTable.visitadoEm)).limit(10);
  const ncs = await db.select({ id: naoConformidadesTable.id, severidade: naoConformidadesTable.severidade, descricao: naoConformidadesTable.descricao, status: naoConformidadesTable.status }).from(naoConformidadesTable).where(eq(naoConformidadesTable.obraId, parse.data.obraId)).limit(20);
  const medicoes = await db.select({ id: medicoesTable.id, valorTotal: medicoesTable.valorTotal, status: medicoesTable.status }).from(medicoesTable).where(eq(medicoesTable.obraId, parse.data.obraId)).limit(10);

  const relatorio = gerarRelatorioTexto(obra, visitas, ncs, medicoes);

  res.json({
    obraId: parse.data.obraId,
    relatorioTexto: relatorio,
    geradoEm: new Date().toISOString(),
  });
});

router.post("/chat", async (req: AuthRequest, res: Response) => {
  const parse = ChatAssistenteBody.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: "Dados inválidos" }); return; }

  const obras = await db.select().from(obrasTable).where(eq(obrasTable.municipioId, req.auth.municipioId)).limit(20);
  const resposta = gerarRespostaChat(parse.data.mensagem, obras);

  res.json({ resposta });
});

function gerarRelatorioTexto(obra: any, visitas: any[], ncs: any[], medicoes: any[]): string {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const progresso = Number(obra.percentualFisicoAtual ?? 0);
  const valor = Number(obra.valorContratado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const ncGraves = ncs.filter((nc) => nc.severidade === "grave" || nc.severidade === "critica").length;
  const ncPendentes = ncs.filter((nc) => nc.status === "pendente").length;

  return `RELATÓRIO EXECUTIVO DE OBRA
Data: ${hoje}

IDENTIFICAÇÃO
Obra: ${obra.nome}
Empresa Contratada: ${obra.empresaContratada}
Tipo: ${obra.tipo}
Status: ${obra.status.replace(/_/g, " ").toUpperCase()}

SITUAÇÃO FINANCEIRA E FÍSICA
Valor Contratado: ${valor}
Avanço Físico Atual: ${progresso}%
Início: ${obra.dataInicio}
Prazo Previsto: ${obra.dataFimPrevista}

VISITAS DE FISCALIZAÇÃO
Total de visitas registradas: ${visitas.length}
Última visita: ${visitas[0]?.visitadoEm ? new Date(visitas[0].visitadoEm).toLocaleDateString("pt-BR") : "N/A"}

NÃO CONFORMIDADES
Total registrado: ${ncs.length}
Pendentes de resolução: ${ncPendentes}
Ocorrências graves/críticas: ${ncGraves}

BOLETINS DE MEDIÇÃO
Total de boletins: ${medicoes.length}
${medicoes.filter((m) => m.status === "aprovada" || m.status === "paga").length} boletins aprovados

CONCLUSÃO
${ncGraves > 0 ? `ATENÇÃO: A obra apresenta ${ncGraves} não conformidade(s) grave(s) ou crítica(s) que requerem ação imediata.` : "A obra não apresenta não conformidades graves no momento."}
Acompanhamento regular recomendado com frequência mínima quinzenal.

Este relatório foi gerado automaticamente pelo sistema FISCALIZA.GOV.`;
}

function gerarRespostaChat(mensagem: string, obras: any[]): string {
  const msg = mensagem.toLowerCase();

  if (msg.includes("atrasad")) {
    const hoje = new Date();
    const atrasadas = obras.filter((o) => {
      const fim = new Date(o.dataFimAtual ?? o.dataFimPrevista);
      return fim < hoje && o.status !== "concluida" && o.status !== "rescindida";
    });
    if (atrasadas.length === 0) return "Nenhuma obra está atrasada no momento. Todas as obras estão dentro do prazo previsto.";
    return `Há ${atrasadas.length} obra(s) atrasada(s):\n${atrasadas.slice(0, 5).map((o) => `- ${o.nome} (prazo era: ${o.dataFimPrevista})`).join("\n")}`;
  }

  if (msg.includes("execução") || msg.includes("execucao") || msg.includes("andamento")) {
    const emExecucao = obras.filter((o) => o.status === "em_execucao");
    return `Há ${emExecucao.length} obra(s) em execução atualmente:\n${emExecucao.slice(0, 5).map((o) => `- ${o.nome} (${Number(o.percentualFisicoAtual ?? 0)}% concluído)`).join("\n")}`;
  }

  if (msg.includes("valor") || msg.includes("investimento")) {
    const total = obras.reduce((acc, o) => acc + Number(o.valorAtual ?? o.valorContratado), 0);
    return `O valor total investido em obras é de ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}, distribuído em ${obras.length} obras.`;
  }

  if (msg.includes("quantas") || msg.includes("total")) {
    return `O município possui ${obras.length} obras cadastradas no sistema:\n- ${obras.filter((o) => o.status === "em_execucao").length} em execução\n- ${obras.filter((o) => o.status === "concluida").length} concluídas\n- ${obras.filter((o) => o.status === "paralisada").length} paralisadas\n- ${obras.filter((o) => o.status === "contratada").length} contratadas`;
  }

  return `Olá! Sou o assistente de gestão do FISCALIZA.GOV. Posso ajudar com informações sobre obras do município. Pergunte sobre obras atrasadas, em execução, valores investidos, ou informações específicas de uma obra.`;
}

export default router;
