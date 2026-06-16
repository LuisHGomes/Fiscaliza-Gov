import React, { useState } from "react";
import { useListDocumentos, useCreateDocumento, useListObras } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, ExternalLink, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";

const CATEGORIAS: Record<string, string> = {
  contrato: "Contrato",
  aditivo: "Aditivo",
  projeto: "Projeto",
  ata: "ATA",
  laudo: "Laudo",
  foto: "Foto",
  outros: "Outros",
};

export default function Documentos() {
  const [categoria, setCategoria] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: documentos = [], isLoading } = useListDocumentos();
  const { data: obras = [] } = useListObras();
  const createDocumento = useCreateDocumento();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, reset } = useForm<any>();

  const filtered = categoria === "todos" ? documentos : documentos.filter((d) => d.categoria === categoria);

  const onSubmit = (data: any) => {
    createDocumento.mutate(
      { data: { ...data, obraId: parseInt(data.obraId) } },
      {
        onSuccess: () => {
          toast({ title: "Documento registrado!" });
          qc.invalidateQueries({ queryKey: ["/api/documentos"] });
          reset();
          setDialogOpen(false);
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar documento" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documentos</h1>
          <p className="text-slate-500 mt-1">Repositório centralizado de documentos das obras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Adicionar Documento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Registrar Documento</DialogTitle></DialogHeader>
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
                  <Label>Categoria *</Label>
                  <select {...register("categoria", { required: true })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Selecione...</option>
                    {Object.entries(CATEGORIAS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Versão</Label>
                  <Input {...register("versao")} placeholder="v1.0" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Nome do Documento *</Label>
                <Input {...register("nome", { required: true })} placeholder="Contrato de Obras CT-2024-001" />
              </div>
              <div className="space-y-1">
                <Label>URL do Arquivo *</Label>
                <Input {...register("fileUrl", { required: true })} placeholder="https://drive.google.com/..." />
              </div>
              <div className="space-y-1">
                <Label>Data de Expiração</Label>
                <Input type="date" {...register("expiracaoEm")} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createDocumento.isPending}>
                  {createDocumento.isPending ? "Salvando..." : "Registrar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={categoria} onValueChange={setCategoria}>
        <SelectTrigger className="w-48">
          <Filter className="w-4 h-4 mr-2" /><SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todas as categorias</SelectItem>
          {Object.entries(CATEGORIAS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="text-center py-16 text-slate-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum documento encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {CATEGORIAS[doc.categoria] ?? doc.categoria}
                      </span>
                      {doc.assinado && (
                        <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">✓ Assinado</span>
                      )}
                    </div>
                    <h3 className="font-medium text-slate-900 text-sm truncate" title={doc.nome}>{doc.nome}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(doc.criadoEm).toLocaleDateString("pt-BR")}</p>
                    {doc.versao && <p className="text-xs text-slate-400">{doc.versao}</p>}
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
