import React, { useState } from "react";
import { useListNotificacoes, useCreateNotificacao, useListObras } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, AlertOctagon, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";

const TIPOS: Record<string, string> = {
  advertencia: "Advertência",
  embargo: "Embargo",
  paralisacao: "Paralisação",
  retomada: "Retomada",
  multa: "Multa Contratual",
};

const STATUS_COLORS: Record<string, string> = {
  aguardando_resposta: "bg-amber-100 text-amber-800",
  respondida: "bg-blue-100 text-blue-800",
  encerrada: "bg-slate-100 text-slate-600",
};

export default function Notificacoes() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: notificacoes = [], isLoading } = useListNotificacoes();
  const { data: obras = [] } = useListObras();
  const createNotificacao = useCreateNotificacao();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<any>();

  const filtered = statusFilter === "todos" ? notificacoes : notificacoes.filter((n) => n.status === statusFilter);

  const onSubmit = (data: any) => {
    createNotificacao.mutate(
      {
        data: {
          ...data,
          obraId: parseInt(data.obraId),
          prazoRespostaDias: data.prazoRespostaDias ? parseInt(data.prazoRespostaDias) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Notificação emitida!" });
          qc.invalidateQueries({ queryKey: ["/api/notificacoes"] });
          reset();
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao emitir notificação" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notificações Formais</h1>
          <p className="text-slate-500 mt-1">Emissão e controle de notificações às empresas contratadas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Emitir Notificação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Emitir Notificação Formal</DialogTitle></DialogHeader>
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
                  <Label>Tipo *</Label>
                  <select {...register("tipo", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Selecione...</option>
                    {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Prazo de Resposta (dias)</Label>
                  <Input type="number" {...register("prazoRespostaDias")} placeholder="15" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Descrição *</Label>
                <textarea {...register("descricao", { required: true })} rows={4} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="Descreva o motivo da notificação..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createNotificacao.isPending}>
                  {createNotificacao.isPending ? "Emitindo..." : "Emitir Notificação"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          <SelectItem value="aguardando_resposta">Aguardando Resposta</SelectItem>
          <SelectItem value="respondida">Respondidas</SelectItem>
          <SelectItem value="encerrada">Encerradas</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma notificação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <Card key={n.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertOctagon className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-xs font-semibold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {TIPOS[n.tipo] ?? n.tipo}
                      </span>
                      <h3 className="font-semibold text-slate-900">{n.obraNome}</h3>
                      {n.numeroSequencial && (
                        <span className="text-xs text-slate-400">Nº {n.numeroSequencial}</span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[n.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {n.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{n.descricao}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Emitida em {new Date(n.enviadoEm).toLocaleDateString("pt-BR")}
                      </span>
                      {n.prazoResposta && (
                        <span>Prazo: {n.prazoResposta}</span>
                      )}
                    </div>
                    {n.textoResposta && (
                      <p className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded">
                        <strong>Resposta:</strong> {n.textoResposta}
                      </p>
                    )}
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
