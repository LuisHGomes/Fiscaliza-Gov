import React from "react";
import { Link } from "wouter";
import { Building2, AlertTriangle, Clock, MapPin, Search, ArrowRight } from "lucide-react";
import { useGetTotalizadores, useListObrasPublicas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Portal() {
  const { data: totalizadores, isLoading: isLoadingTot } = useGetTotalizadores();
  const { data: obras, isLoading: isLoadingObras } = useListObrasPublicas();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-slate-50 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Portal da Transparência</h1>
              <p className="text-sm text-slate-400">{totalizadores?.municipio || "Obras Públicas"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="text-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white">
                Acesso Restrito
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {!isLoadingTot && totalizadores && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total de Obras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalizadores.totalObras}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Em Execução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalizadores.obrasEmExecucao}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalizadores.obrasConcluidas || 0}</div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Investimento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalizadores.valorTotalInvestido)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Obras em Destaque</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar por bairro, nome..." className="pl-9 bg-white" />
          </div>
        </div>

        {isLoadingObras ? (
          <div className="text-center py-12 text-slate-500">Carregando obras...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras?.map((obra) => (
              <Card key={obra.id} className="overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-200 w-full relative">
                  {obra.fotos && obra.fotos.length > 0 ? (
                    <img src={obra.fotos[0]} alt={obra.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 hover:bg-white border-none shadow-sm">
                    {obra.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <CardHeader className="pb-2 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">{obra.tipo.toUpperCase()}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{obra.nome}</CardTitle>
                  <div className="flex items-center text-sm text-slate-500 mt-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{obra.bairro || "Não informado"}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span>Progresso</span>
                    <span>{obra.percentualFisicoAtual}%</span>
                  </div>
                  <Progress value={obra.percentualFisicoAtual} className="h-2" />
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-slate-500">
                      Valor Contratado
                    </div>
                    <div className="font-semibold text-slate-900">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(obra.valorContratado)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
