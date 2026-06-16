import React, { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetObra, useGetObraTimeline, useListVisitas, useListNaoConformidades,
  useListMedicoes, useListDocumentos, useListAditivos, useGetObraEquipe,
  useGetMe, useListUsuarios, useAddFiscalObra, useRemoveFiscalObra
} from "@workspace/api-client-react";
import {
  ArrowLeft, Building2, CheckCircle2, Clock, AlertTriangle, FileText,
  ClipboardList, HardHat, PlusCircle, TrendingUp, Users, Shield, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  contratada: { label: "Contratada", color: "bg-blue-100 text-blue-800" },
  em_execucao: { label: "Em Execução", color: "bg-green-100 text-green-800" },
  paralisada: { label: "Paralisada", color: "bg-amber-100 text-amber-800" },
  concluida: { label: "Concluída", color: "bg-slate-100 text-slate-700" },
  rescindida: { label: "Rescindida", color: "bg-red-100 text-red-800" },
};

const TIPO_LABELS: Record<string, string> = {
  pavimentacao: "Pavimentação",
  edificacao: "Edificação",
  saneamento: "Saneamento",
  pontes: "Pontes/Viadutos",
  iluminacao: "Iluminação",
  outros: "Outros",
};

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  visita: HardHat,
  medicao: ClipboardList,
  aditivo: FileText,
  notificacao: AlertTriangle,
};

const TIMELINE_COLORS: Record<string, string> = {
  visita: "bg-green-100 text-green-700",
  medicao: "bg-blue-100 text-blue-700",
  aditivo: "bg-purple-100 text-purple-700",
  notificacao: "bg-amber-100 text-amber-700",
};

export default function ObraDetalhe() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [tab, setTab] = useState<"visao-geral" | "timeline" | "financeiro" | "equipe">("visao-geral");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: obra, isLoading } = useGetObra(id);
  const { data: timeline = [] } = useGetObraTimeline(id);
  const { data: visitas = [] } = useListVisitas({ obraId: id });
  const { data: ncs = [] } = useListNaoConformidades({ obraId: id });
  const { data: medicoes = [] } = useListMedicoes({ obraId: id });
  const { data: documentos = [] } = useListDocumentos({ obraId: id });
  const { data: aditivos = [] } = useListAditivos(id);
  const { data: equipe = [], refetch: refetchEquipe } = useGetObraEquipe(id);
  const { data: user } = useGetMe();
  const { data: allUsuarios = [] } = useListUsuarios();
  const addFiscal = useAddFiscalObra();
  const removeFiscal = useRemoveFiscalObra();

  const [selectedFiscalId, setSelectedFiscalId] = useState<string>("");
  const [selectedNivel, setSelectedNivel] = useState<string>("auxiliar");

  const isAdmin = user?.perfil === "administrador" || user?.perfil === "gestor";

  const equipeIds = new Set(equipe.map((e: any) => e.usuarioId));
  const disponiveisParaAdicionar = allUsuarios.filter(
    (u: any) => !equipeIds.has(u.id) && (u.perfil === "fiscal" || u.perfil === "engenheiro")
  );

  const handleAddFiscal = () => {
    if (!selectedFiscalId) return;
    addFiscal.mutate(
      { id, addFiscalInput: { usuarioId: Number(selectedFiscalId), nivel: selectedNivel as any } },
      {
        onSuccess: () => {
          toast({ title: "Fiscal adicionado à equipe" });
          setSelectedFiscalId("");
          refetchEquipe();
        },
        onError: () => toast({ title: "Erro ao adicionar fiscal", variant: "destructive" }),
      }
    );
  };

  const handleRemoveFiscal = (userId: number) => {
    removeFiscal.mutate(
      { id, userId },
      {
        onSuccess: () => {
          toast({ title: "Fiscal removido da equipe" });
          refetchEquipe();
        },
        onError: () => toast({ title: "Erro ao remover fiscal", variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Carregando obra...</div>;
  if (!obra) return <div className="p-8 text-center text-slate-500">Obra não encontrada.</div>;

  const status = STATUS_LABELS[obra.status] ?? { label: obra.status, color: "bg-slate-100 text-slate-700" };
  const hoje = new Date();
  const fim = new Date(obra.dataFimAtual ?? obra.dataFimPrevista);
  const isAtrasada = fim < hoje && obra.status !== "concluida" && obra.status !== "rescindida";

  const valorAtual = Number(obra.valorAtual ?? obra.valorContratado);
  const valorContratado = Number(obra.valorContratado);
  const sobrepreco = valorAtual - valorContratado;
  const ncsPendentes = ncs.filter((nc) => nc.status === "pendente");
  const medicoesPendentes = medicoes.filter((m) => m.status !== "aprovada" && m.status !== "paga");
  const valorMedido = medicoes.reduce((acc, m) => acc + Number(m.valorTotal), 0);

  const TABS = [
    { id: "visao-geral", label: "Visão Geral" },
    { id: "timeline", label: `Timeline (${timeline.length})` },
    { id: "financeiro", label: "Financeiro" },
    { id: "equipe", label: `Equipe (${equipe.length})` },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/obras">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{obra.nome}</h1>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>{status.label}</span>
            {isAtrasada && (
              <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Atrasada
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {TIPO_LABELS[obra.tipo] ?? obra.tipo} • {obra.empresaContratada}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avanço Físico", value: `${Number(obra.percentualFisicoAtual ?? 0).toFixed(1)}%`, icon: TrendingUp, color: "text-primary" },
          { label: "NCs Pendentes", value: ncsPendentes.length.toString(), icon: AlertTriangle, color: ncsPendentes.length > 0 ? "text-amber-600" : "text-slate-400" },
          { label: "Visitas Realizadas", value: visitas.length.toString(), icon: HardHat, color: "text-slate-700" },
          { label: "Medições", value: `${medicoesPendentes.length} pendente(s)`, icon: ClipboardList, color: "text-blue-600" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
              <div>
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "visao-geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Informações do Contrato</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Nº Contrato", value: obra.numeroContrato ?? "—" },
                { label: "Valor Contratado", value: valorContratado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
                { label: "Valor Atual", value: valorAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) },
                { label: "CNPJ Empresa", value: obra.cnpjEmpresa ?? "—" },
                { label: "Fonte de Recursos", value: obra.fonteRecursos ?? "—" },
                { label: "Data de Início", value: obra.dataInicio },
                { label: "Prazo Previsto", value: obra.dataFimPrevista },
                { label: "Responsável Técnico", value: obra.responsavelTecnico ?? "—" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-slate-800 text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Avanço físico</span>
                  <span>{Number(obra.percentualFisicoAtual ?? 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Number(obra.percentualFisicoAtual ?? 0))}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Não Conformidades ({ncsPendentes.length} abertas)</CardTitle>
                  <Link href="/nao-conformidades">
                    <Button variant="ghost" size="sm">Ver todas</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {ncsPendentes.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma NC pendente</p>
                ) : (
                  <div className="space-y-2">
                    {ncsPendentes.slice(0, 3).map((nc) => (
                      <div key={nc.id} className="flex gap-2 text-sm p-2 rounded bg-amber-50">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-700 line-clamp-2">{nc.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Documentos ({documentos.length})</CardTitle>
                  <Link href="/documentos">
                    <Button variant="ghost" size="sm">Ver todos</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {documentos.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhum documento cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {documentos.slice(0, 4).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="truncate max-w-[200px]">{doc.nome}</span>
                        </div>
                        <span className="text-xs text-slate-400">{doc.categoria}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum evento registrado ainda.</p>
            </div>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />
              {timeline.map((ev) => {
                const Icon = TIMELINE_ICONS[ev.tipo] ?? Building2;
                const colorClass = TIMELINE_COLORS[ev.tipo] ?? "bg-slate-100 text-slate-600";
                return (
                  <div key={ev.id} className="relative mb-4">
                    <div className={`absolute -left-4 w-5 h-5 rounded-full flex items-center justify-center z-10 ${colorClass}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <Card className="ml-4">
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-800">{ev.descricao}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(ev.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "equipe" && (
        <div className="space-y-6">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar à Equipe</CardTitle>
                <CardDescription>Selecione um fiscal ou engenheiro e defina seu nível de responsabilidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs text-muted-foreground mb-1.5">Usuário</p>
                    <Select value={selectedFiscalId} onValueChange={setSelectedFiscalId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar fiscal/engenheiro..." />
                      </SelectTrigger>
                      <SelectContent>
                        {disponiveisParaAdicionar.length === 0 ? (
                          <SelectItem value="none" disabled>Nenhum disponível</SelectItem>
                        ) : (
                          disponiveisParaAdicionar.map((u: any) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.nome} ({u.perfil})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-40">
                    <p className="text-xs text-muted-foreground mb-1.5">Nível</p>
                    <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="auxiliar">Auxiliar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddFiscal}
                    disabled={!selectedFiscalId || selectedFiscalId === "none" || addFiscal.isPending}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Equipe de Fiscalização ({equipe.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipe.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">Nenhum fiscal designado para esta obra.</p>
                  {isAdmin && (
                    <p className="text-slate-400 text-xs mt-1">Use o formulário acima para adicionar membros à equipe.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {equipe.map((membro: any) => (
                    <div key={membro.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0">
                          {(membro.usuarioNome ?? "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{membro.usuarioNome}</p>
                          <p className="text-xs text-muted-foreground">{membro.usuarioEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={membro.nivel === "principal" ? "default" : "secondary"} className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {membro.nivel === "principal" ? "Fiscal Principal" : "Fiscal Auxiliar"}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">{membro.usuarioPerfil}</span>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveFiscal(membro.usuarioId)}
                            disabled={removeFiscal.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "financeiro" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Situação Financeira</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Valor Contratado</span>
                  <span className="font-semibold">{valorContratado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Valor Atual (com aditivos)</span>
                  <span className="font-semibold">{valorAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {sobrepreco !== 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Acréscimo por aditivos</span>
                    <span className={`font-semibold ${sobrepreco > 0 ? "text-amber-600" : "text-green-600"}`}>
                      {sobrepreco > 0 ? "+" : ""}{sobrepreco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-slate-100 pt-2 mt-2">
                  <span className="text-slate-500">Total medido</span>
                  <span className="font-semibold text-primary">{valorMedido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Medido vs. Contratado ({((valorMedido / valorContratado) * 100).toFixed(1)}%)
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, (valorMedido / valorContratado) * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Aditivos Contratuais ({aditivos.length})</CardTitle></CardHeader>
            <CardContent>
              {aditivos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhum aditivo registrado</p>
              ) : (
                <div className="space-y-3">
                  {aditivos.map((a) => (
                    <div key={a.id} className="border rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">Aditivo Nº {a.numeroAditivo}</span>
                        <span className="text-xs uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{a.tipo}</span>
                      </div>
                      <p className="text-slate-600 text-xs">{a.justificativa}</p>
                      {a.valorAcrescimo && (
                        <p className="text-amber-700 font-medium mt-1">
                          +{Number(a.valorAcrescimo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                      )}
                      {a.diasAcrescimo && (
                        <p className="text-slate-500 text-xs">+{a.diasAcrescimo} dias</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Boletins de Medição</CardTitle></CardHeader>
            <CardContent>
              {medicoes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Nenhum boletim registrado</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 text-xs border-b">
                        <th className="pb-2 pr-4">Período</th>
                        <th className="pb-2 pr-4">Valor</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {medicoes.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2 pr-4">{m.periodoInicio} a {m.periodoFim}</td>
                          <td className="py-2 pr-4 font-medium">{Number(m.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                          <td className="py-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {m.status?.replace(/_/g, " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
