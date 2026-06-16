import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Search, Calendar, TrendingUp, AlertTriangle, HardHat } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useGetMe } from "@workspace/api-client-react";

const STATUS_LABELS: Record<string, string> = {
  contratada: "Contratada",
  em_execucao: "Em Execução",
  paralisada: "Paralisada",
  concluida: "Concluída",
  rescindida: "Rescindida",
};

const STATUS_COLORS: Record<string, string> = {
  contratada: "secondary",
  em_execucao: "default",
  paralisada: "destructive",
  concluida: "outline",
  rescindida: "destructive",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MinhasObras() {
  const { data: user } = useGetMe();
  const [search, setSearch] = React.useState("");
  const [obras, setObras] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("fiscaliza_token");
    fetch("/api/obras/minhas", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setObras(Array.isArray(data) ? data : []))
      .catch(() => setObras([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = obras.filter((o) =>
    !search || o.nome.toLowerCase().includes(search.toLowerCase()) || o.empresaContratada?.toLowerCase().includes(search.toLowerCase())
  );

  const isPerfil = (p: string) => user?.perfil === p;
  const isAdmin = isPerfil("administrador") || isPerfil("gestor");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Obras</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Todas as obras do município"
            : "Obras em que você está designado como fiscal"}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar obras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando obras...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HardHat className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              {obras.length === 0
                ? "Você não está designado em nenhuma obra"
                : "Nenhuma obra encontrada com esse filtro"}
            </p>
            {obras.length === 0 && !isAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                Solicite ao administrador para ser adicionado a uma obra.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((obra) => {
            const pct = Number(obra.percentualFisicoAtual ?? 0);
            const dataFim = obra.dataFimPrevista ? new Date(obra.dataFimPrevista) : null;
            const atrasada = dataFim && dataFim < new Date() && obra.status === "em_execucao";

            return (
              <Link key={obra.id} href={`/obras/${obra.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-border">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-tight truncate">{obra.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{obra.empresaContratada}</p>
                        </div>
                      </div>
                      <Badge variant={(STATUS_COLORS[obra.status] as any) ?? "secondary"} className="flex-shrink-0 text-xs">
                        {STATUS_LABELS[obra.status] ?? obra.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Avanço Físico
                        </span>
                        <span className="font-medium text-foreground">{pct.toFixed(1)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Valor contratado</p>
                        <p className="font-medium">{formatCurrency(Number(obra.valorContratado))}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Prazo
                        </p>
                        <p className={`font-medium ${atrasada ? "text-destructive" : ""}`}>
                          {dataFim ? dataFim.toLocaleDateString("pt-BR") : "—"}
                          {atrasada && (
                            <AlertTriangle className="w-3 h-3 inline ml-1 text-destructive" />
                          )}
                        </p>
                      </div>
                    </div>

                    {obra.logradouro && (
                      <p className="text-xs text-muted-foreground truncate">{obra.logradouro}{obra.bairro ? ` — ${obra.bairro}` : ""}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
