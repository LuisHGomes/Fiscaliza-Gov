import React, { useState } from "react";
import { useListVisitas, useCreateVisita, useListObras } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { HardHat, Plus, Search, MapPin, Users, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

export default function Visitas() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: visitas = [], isLoading } = useListVisitas();
  const { data: obras = [] } = useListObras();
  const createVisita = useCreateVisita();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<any>();

  const filtered = visitas.filter((v) =>
    !search || v.obraNome?.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (data: any) => {
    createVisita.mutate(
      {
        data: {
          ...data,
          obraId: parseInt(data.obraId),
          percentualFisico: parseFloat(data.percentualFisico),
          totalTrabalhadores: data.totalTrabalhadores ? parseInt(data.totalTrabalhadores) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Visita registrada com sucesso!" });
          qc.invalidateQueries({ queryKey: ["/api/visitas"] });
          reset();
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar visita" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visitas de Fiscalização</h1>
          <p className="text-slate-500 mt-1">Registro de inspeções realizadas nas obras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Nova Visita</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Visita de Fiscalização</DialogTitle></DialogHeader>
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
                  <Label>Avanço Físico (%) *</Label>
                  <Input type="number" step="0.1" min="0" max="100" {...register("percentualFisico", { required: true })} placeholder="0-100" />
                </div>
                <div className="space-y-1">
                  <Label>Total de Trabalhadores</Label>
                  <Input type="number" {...register("totalTrabalhadores")} placeholder="0" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Atividades Executadas</Label>
                <textarea {...register("atividadesExecutadas")} rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="Descreva as atividades realizadas..." />
              </div>
              <div className="space-y-1">
                <Label>Observações</Label>
                <textarea {...register("observacoes")} rows={2} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="Observações adicionais..." />
              </div>
              <div className="space-y-1">
                <Label>Condições Climáticas</Label>
                <Input {...register("condicoesClimaticas")} placeholder="Sol, chuva, nublado..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createVisita.isPending}>
                  {createVisita.isPending ? "Salvando..." : "Registrar Visita"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input placeholder="Buscar por obra..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md" />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando visitas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <HardHat className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma visita registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{v.obraNome}</h3>
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                        {Number(v.percentualFisico).toFixed(1)}% concluído
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mb-2">
                      Fiscal: <span className="font-medium text-slate-700">{v.fiscalNome ?? ""}</span>
                      {" • "}
                      {new Date(v.visitadoEm).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {v.atividadesExecutadas && (
                      <p className="text-sm text-slate-600 line-clamp-2">{v.atividadesExecutadas}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                      {v.totalTrabalhadores && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.totalTrabalhadores} trabalhadores</span>
                      )}
                      {v.gpsLat && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />GPS registrado</span>
                      )}
                      {v.totalFotos && v.totalFotos > 0 && (
                        <span className="flex items-center gap-1"><Camera className="w-3 h-3" />{v.totalFotos} foto(s)</span>
                      )}
                      {v.condicoesClimaticas && (
                        <span>{v.condicoesClimaticas}</span>
                      )}
                    </div>
                  </div>
                  {v.totalNaoConformidades && v.totalNaoConformidades > 0 && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                      {v.totalNaoConformidades} NC
                    </span>
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
