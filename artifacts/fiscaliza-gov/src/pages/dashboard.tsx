import React from "react";
import { useGetDashboardKpis, useGetAtividadeRecente, useGetObrasEmRisco } from "@workspace/api-client-react";
import { Building2, AlertTriangle, Clock, CheckCircle2, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: kpis, isLoading: isLoadingKpis } = useGetDashboardKpis();
  const { data: atividadesRaw, isLoading: isLoadingAtv } = useGetAtividadeRecente();
  const { data: riscosRaw, isLoading: isLoadingRisco } = useGetObrasEmRisco();
  const riscos = Array.isArray(riscosRaw) ? riscosRaw : [];
  const atividades = Array.isArray(atividadesRaw) ? atividadesRaw : [];

  if (isLoadingKpis || isLoadingAtv || isLoadingRisco) {
    return <div className="p-8 text-center text-slate-500">Carregando painel de controle...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel de Controle</h1>
        <p className="text-slate-500 mt-1">Visão geral executiva das obras públicas do município.</p>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras em Execução</CardTitle>
              <Building2 className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.obrasEmExecucao}</div>
              <p className="text-xs text-slate-500">De um total de {kpis.totalObras} contratos</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Execução</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(kpis.valorTotalEmExecucao)}
              </div>
              <p className="text-xs text-slate-500">Em contratos ativos</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Obras Atrasadas</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{kpis.obrasAtrasadas}</div>
              <p className="text-xs text-slate-500">Abaixo do cronograma previsto</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-destructive">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kpis.naoConformidadesAbertas}</div>
              <p className="text-xs text-slate-500">Abertas e pendentes de resolução</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Obras em Risco Crítico</CardTitle>
              <CardDescription>Atenção imediata requerida pela equipe de gestão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riscos && riscos.length > 0 ? riscos.map((risco) => (
                  <div key={risco.id} className="flex items-start justify-between p-4 border rounded-lg bg-red-50/50 border-red-100">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">{risco.nome}</div>
                      <div className="text-sm text-slate-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        {risco.motivoRisco}
                      </div>
                    </div>
                    <Badge variant="destructive" className="uppercase">{risco.nivelRisco}</Badge>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 text-center py-6">
                    Nenhuma obra com risco crítico detectado no momento.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {atividades && atividades.map((ativ) => (
                  <div key={ativ.id} className="flex gap-4">
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        {ativ.tipo === 'visita' ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <FileText className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none text-slate-900">{ativ.descricao}</p>
                      <p className="text-xs text-slate-500">{ativ.obraNome}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ativ.data).toLocaleDateString('pt-BR')} • {ativ.autor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
