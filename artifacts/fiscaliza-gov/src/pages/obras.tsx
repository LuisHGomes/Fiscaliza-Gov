import React, { useState } from "react";
import { useListObras, useCreateObra, useDeleteObra } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Building2, Plus, Search, Filter, Trash2, Eye, AlertTriangle,
  CheckCircle2, Clock, XCircle, PauseCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  contratada: { label: "Contratada", color: "bg-blue-100 text-blue-800", icon: Clock },
  em_execucao: { label: "Em Execução", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  paralisada: { label: "Paralisada", color: "bg-amber-100 text-amber-800", icon: PauseCircle },
  concluida: { label: "Concluída", color: "bg-slate-100 text-slate-700", icon: CheckCircle2 },
  rescindida: { label: "Rescindida", color: "bg-red-100 text-red-800", icon: XCircle },
};

const TIPO_LABELS: Record<string, string> = {
  pavimentacao: "Pavimentação",
  edificacao: "Edificação",
  saneamento: "Saneamento",
  pontes: "Pontes/Viadutos",
  iluminacao: "Iluminação",
  outros: "Outros",
};

function ObraStatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: "bg-slate-100 text-slate-700", icon: Building2 };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${s.color}`}>
      <s.icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function NovaObraForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const createObra = useCreateObra();
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  const onSubmit = (data: any) => {
    createObra.mutate(
      {
        data: {
          ...data,
          valorContratado: parseFloat(data.valorContratado),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Obra criada com sucesso!" });
          qc.invalidateQueries({ queryKey: ["/api/obras"] });
          reset();
          onSuccess();
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao criar obra" }),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Nome da Obra *</Label>
          <Input {...register("nome", { required: true })} placeholder="Ex: Pavimentação Rua XV" />
        </div>
        <div className="space-y-1">
          <Label>Tipo *</Label>
          <select {...register("tipo", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Valor Contratado (R$) *</Label>
          <Input type="number" step="0.01" {...register("valorContratado", { required: true })} placeholder="1250000.00" />
        </div>
        <div className="space-y-1">
          <Label>Data de Início *</Label>
          <Input type="date" {...register("dataInicio", { required: true })} />
        </div>
        <div className="space-y-1">
          <Label>Prazo Final Previsto *</Label>
          <Input type="date" {...register("dataFimPrevista", { required: true })} />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>Empresa Contratada *</Label>
          <Input {...register("empresaContratada", { required: true })} placeholder="Razão social da empresa" />
        </div>
        <div className="space-y-1">
          <Label>Número do Contrato</Label>
          <Input {...register("numeroContrato")} placeholder="CT-2024-001" />
        </div>
        <div className="space-y-1">
          <Label>Fonte de Recursos</Label>
          <Input {...register("fonteRecursos")} placeholder="PAC, FNDE, Tesouro..." />
        </div>
        <div className="space-y-1">
          <Label>Bairro/Localidade</Label>
          <Input {...register("bairro")} placeholder="Centro" />
        </div>
        <div className="space-y-1">
          <Label>Responsável Técnico</Label>
          <Input {...register("responsavelTecnico")} placeholder="Eng. João - CREA 123456" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={createObra.isPending}>
          {createObra.isPending ? "Salvando..." : "Cadastrar Obra"}
        </Button>
      </div>
    </form>
  );
}

export default function Obras() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: obras = [], isLoading } = useListObras();
  const deleteObra = useDeleteObra();
  const qc = useQueryClient();
  const { toast } = useToast();

  const filteredObras = obras.filter((o) => {
    const matchSearch = !search || o.nome.toLowerCase().includes(search.toLowerCase()) ||
      o.empresaContratada.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id: number, nome: string) => {
    if (!confirm(`Excluir a obra "${nome}"? Esta ação não pode ser desfeita.`)) return;
    deleteObra.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Obra excluída" });
        qc.invalidateQueries({ queryKey: ["/api/obras"] });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Obras</h1>
          <p className="text-slate-500 mt-1">Gerenciamento de todos os contratos de obras públicas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Obra</DialogTitle>
            </DialogHeader>
            <NovaObraForm onSuccess={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, s]) => (
              <SelectItem key={v} value={v}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando obras...</div>
      ) : filteredObras.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma obra encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredObras.map((obra) => (
            <Card key={obra.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold text-slate-900 truncate">{obra.nome}</h3>
                      <ObraStatusBadge status={obra.status} />
                      {obra.totalNaoConformidades && obra.totalNaoConformidades > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {obra.totalNaoConformidades} NC
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm text-slate-600 mt-1">
                      <span><span className="font-medium">Tipo:</span> {TIPO_LABELS[obra.tipo] ?? obra.tipo}</span>
                      <span><span className="font-medium">Empresa:</span> {obra.empresaContratada}</span>
                      <span><span className="font-medium">Valor:</span> {Number(obra.valorContratado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      <span><span className="font-medium">Prazo:</span> {obra.dataFimPrevista}</span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Avanço físico</span>
                        <span className="font-medium text-slate-700">{Number(obra.percentualFisicoAtual ?? 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Number(obra.percentualFisicoAtual ?? 0))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/obras/${obra.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Detalhes
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(obra.id, obra.nome)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
