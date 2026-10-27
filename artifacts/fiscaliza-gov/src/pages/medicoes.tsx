import React, { useState } from "react";
import { useListMedicoes, useCreateMedicao, useAprovarMedicao, useListObras } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus, CheckCircle2, Clock, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";

const STATUS_LABELS: Record<string, { label: string; next: string | null }> = {
  rascunho: { label: "Rascunho", next: "Enviar para Engenheiro" },
  aguardando_engenheiro: { label: "Aguardando Engenheiro", next: "Aprovar como Engenheiro" },
  aguardando_gestor: { label: "Aguardando Gestor", next: "Aprovar como Gestor" },
  aprovada: { label: "Aprovada", next: "Marcar como Paga" },
  paga: { label: "Paga", next: null },
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-slate-100 text-slate-600",
  aguardando_engenheiro: "bg-amber-100 text-amber-800",
  aguardando_gestor: "bg-blue-100 text-blue-800",
  aprovada: "bg-green-100 text-green-800",
  paga: "bg-primary/10 text-primary",
};

export default function Medicoes() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: medicoes = [], isLoading } = useListMedicoes();
  const { data: obras = [] } = useListObras();
  const createMedicao = useCreateMedicao();
  const aprovarMedicao = useAprovarMedicao();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<any>();

  const filtered = statusFilter === "todos" ? medicoes : medicoes.filter((m) => m.status === statusFilter);

  const onSubmit = (data: any) => {
    createMedicao.mutate(
      {
        data: {
          ...data,
          obraId: parseInt(data.obraId),
          valorTotal: parseFloat(data.valorTotal),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Boletim de medição criado!" });
          qc.invalidateQueries({ queryKey: ["/api/medicoes"] });
          reset();
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao criar medição" }),
      }
    );
  };

  const handleAprovar = (id: number) => {
    aprovarMedicao.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Medição avançada com sucesso!" });
          qc.invalidateQueries({ queryKey: ["/api/medicoes"] });
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao aprovar medição" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Boletins de Medição</h1>
          <p className="text-slate-500 mt-1">Controle financeiro dos contratos de obras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Novo Boletim</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Criar Boletim de Medição</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Obra *</Label>
                <select {...register("obraId", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Selecione a obra...</option>
                  {obras.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Período Início *</Label>
                  <Input type="date" {...register("periodoInicio", { required: true })} />
                </div>
                <div className="space-y-1">
                  <Label>Período Fim *</Label>
                  <Input type="date" {...register("periodoFim", { required: true })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Valor Total (R$) *</Label>
                <Input type="number" step="0.01" {...register("valorTotal", { required: true })} placeholder="85000.00" />
              </div>
              <div className="space-y-1">
                <Label>Observações</Label>
                <textarea {...register("observacoes")} rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createMedicao.isPending}>
                  {createMedicao.isPending ? "Salvando..." : "Criar Boletim"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-56">
          <Filter className="w-4 h-4 mr-2" /><SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {Object.entries(STATUS_LABELS).map(([v, s]) => <SelectItem key={v} value={v}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum boletim de medição encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => {
            const statusInfo = STATUS_LABELS[m.status] ?? { label: m.status, next: null };
            return (
              <Card key={m.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold text-slate-900">{m.obraNome}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[m.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-slate-600">
                        <span><span className="font-medium">Período:</span> {m.periodoInicio} a {m.periodoFim}</span>
                        <span><span className="font-medium">Valor:</span> {Number(m.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        <span><span className="font-medium">Criado em:</span> {m.criadoEm ? new Date(m.criadoEm).toLocaleDateString("pt-BR") : ""}</span>
                      </div>
                      {m.aprovadoEm && (
                        <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprovado em {new Date(m.aprovadoEm).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    {statusInfo.next && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAprovar(m.id)}
                        disabled={aprovarMedicao.isPending}
                        className="flex-shrink-0"
                      >
                        {statusInfo.next}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
