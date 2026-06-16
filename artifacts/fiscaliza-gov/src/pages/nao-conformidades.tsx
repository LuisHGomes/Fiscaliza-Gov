import React, { useState } from "react";
import { useListNaoConformidades, useResolverNaoConformidade, useListObras, useCreateNaoConformidade, useListVisitas } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, CheckCircle2, Clock, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";

const SEV_COLORS: Record<string, string> = {
  leve: "bg-slate-100 text-slate-700",
  moderada: "bg-amber-100 text-amber-800",
  grave: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
};

const SEV_LABELS: Record<string, string> = {
  leve: "Leve",
  moderada: "Moderada",
  grave: "Grave",
  critica: "Crítica",
};

function ResolverDialog({ nc, onSuccess }: { nc: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();
  const resolverMutation = useResolverNaoConformidade();
  const { toast } = useToast();

  const onSubmit = (data: any) => {
    resolverMutation.mutate(
      { id: nc.id, data: { resolucaoDescricao: data.resolucaoDescricao } },
      {
        onSuccess: () => {
          toast({ title: "Não conformidade resolvida!" });
          setOpen(false);
          reset();
          onSuccess();
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao resolver NC" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-green-700 border-green-200 hover:bg-green-50">
          <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar Resolução</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-slate-600">{nc.descricao}</p>
          <div className="space-y-1">
            <Label>Descrição da resolução *</Label>
            <textarea {...register("resolucaoDescricao", { required: true })} rows={4} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="Descreva como a não conformidade foi corrigida..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={resolverMutation.isPending}>
              {resolverMutation.isPending ? "Salvando..." : "Confirmar Resolução"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function NaoConformidades() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sevFilter, setSevFilter] = useState("todos");
  const { data: ncs = [], isLoading } = useListNaoConformidades();
  const { data: obras = [] } = useListObras();
  const { data: visitas = [] } = useListVisitas();
  const createNC = useCreateNaoConformidade();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<any>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = ncs.filter((nc) => {
    const matchStatus = statusFilter === "todos" || nc.status === statusFilter;
    const matchSev = sevFilter === "todos" || nc.severidade === sevFilter;
    return matchStatus && matchSev;
  });

  const onSubmit = (data: any) => {
    createNC.mutate(
      {
        data: {
          ...data,
          obraId: parseInt(data.obraId),
          visitaId: data.visitaId ? parseInt(data.visitaId) : undefined,
          prazoCorrecaoDias: data.prazoCorrecaoDias ? parseInt(data.prazoCorrecaoDias) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Não conformidade registrada!" });
          qc.invalidateQueries({ queryKey: ["/api/nao-conformidades"] });
          reset();
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar NC" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Não Conformidades</h1>
          <p className="text-slate-500 mt-1">Ocorrências e pendências registradas nas obras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Registrar NC</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Não Conformidade</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Obra *</Label>
                <select {...register("obraId", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Selecione...</option>
                  {obras.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Severidade *</Label>
                  <select {...register("severidade", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Selecione...</option>
                    {Object.entries(SEV_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Prazo de Correção (dias)</Label>
                  <Input type="number" {...register("prazoCorrecaoDias")} placeholder="7" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Descrição *</Label>
                <textarea {...register("descricao", { required: true })} rows={4} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="Descreva a não conformidade..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createNC.isPending}>
                  {createNC.isPending ? "Salvando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="em_correcao">Em Correção</SelectItem>
            <SelectItem value="resolvida">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Toda severidade</SelectItem>
            {Object.entries(SEV_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma não conformidade encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((nc) => (
            <Card key={nc.id} className={`transition-shadow hover:shadow-md ${nc.status === "resolvida" ? "opacity-70" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${SEV_COLORS[nc.severidade]}`}>
                        {SEV_LABELS[nc.severidade] ?? nc.severidade}
                      </span>
                      <h3 className="font-medium text-slate-900">{nc.obraNome}</h3>
                      {nc.status === "resolvida" ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolvida
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{nc.descricao}</p>
                    {nc.prazoCorrecaoDias && nc.status !== "resolvida" && (
                      <p className="text-xs text-slate-500 mt-1">Prazo: {nc.prazoCorrecaoDias} dias</p>
                    )}
                    {nc.resolucaoDescricao && (
                      <p className="text-xs text-green-700 mt-2 bg-green-50 p-2 rounded">
                        <strong>Resolução:</strong> {nc.resolucaoDescricao}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Registrada em {new Date(nc.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {nc.status !== "resolvida" && (
                    <ResolverDialog nc={nc} onSuccess={() => qc.invalidateQueries({ queryKey: ["/api/nao-conformidades"] })} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
