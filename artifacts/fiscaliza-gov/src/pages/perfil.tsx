import React from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Clock, Activity, KeyRound, LogOut, Building2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const PERFIL_LABELS: Record<string, string> = {
  administrador: "Administrador",
  gestor: "Gestor Municipal",
  fiscal: "Fiscal de Obras",
  engenheiro: "Engenheiro",
  auditor: "Auditor",
  cidadao: "Cidadão",
};

const PERFIL_COLORS: Record<string, string> = {
  administrador: "destructive",
  gestor: "default",
  fiscal: "secondary",
  engenheiro: "outline",
  auditor: "outline",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Perfil() {
  const { data: user } = useGetMe();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [savingPerfil, setSavingPerfil] = React.useState(false);

  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [savingSenha, setSavingSenha] = React.useState(false);

  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setNome(user.nome ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  React.useEffect(() => {
    setLoadingLogs(true);
    const token = localStorage.getItem("fiscaliza_token");
    fetch("/api/audit-logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAuditLogs(Array.isArray(data) ? data : []))
      .catch(() => setAuditLogs([]))
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleSavePerfil = async () => {
    setSavingPerfil(true);
    const token = localStorage.getItem("fiscaliza_token");
    try {
      const res = await fetch("/api/usuarios/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nome, email }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      toast({ title: "Perfil atualizado com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleSaveSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    setSavingSenha(true);
    const token = localStorage.getItem("fiscaliza_token");
    try {
      const res = await fetch("/api/usuarios/me/senha", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao alterar senha");
      }
      toast({ title: "Senha alterada com sucesso" });
      setSenhaAtual(""); setNovaSenha(""); setConfirmarSenha("");
    } catch (err: any) {
      toast({ title: err.message || "Erro ao alterar senha", variant: "destructive" });
    } finally {
      setSavingSenha(false);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("fiscaliza_token");
    fetch("/api/auth/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    localStorage.removeItem("fiscaliza_token");
    setLocation("/login");
  };

  if (!user) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Profile header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {getInitials(user.nome ?? "US")}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.nome}</h2>
              <p className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={(PERFIL_COLORS[user.perfil ?? ""] as any) ?? "secondary"}>
                  <Shield className="w-3 h-3 mr-1" />
                  {PERFIL_LABELS[user.perfil ?? ""] ?? user.perfil}
                </Badge>
                {user.municipioNome && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {user.municipioNome}
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Encerrar Sessão
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dados">
        <TabsList>
          <TabsTrigger value="dados">
            <User className="w-4 h-4 mr-2" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="senha">
            <KeyRound className="w-4 h-4 mr-2" />
            Alterar Senha
          </TabsTrigger>
          <TabsTrigger value="atividades">
            <Activity className="w-4 h-4 mr-2" />
            Histórico de Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <Input value={PERFIL_LABELS[user.perfil ?? ""] ?? user.perfil} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Município</Label>
                  <Input value={user.municipioNome ?? "—"} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Data de Cadastro</Label>
                  <Input
                    value={user.criadoEm ? new Date(user.criadoEm).toLocaleDateString("pt-BR") : "—"}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSavePerfil} disabled={savingPerfil}>
                  {savingPerfil ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senha" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Escolha uma senha segura com no mínimo 6 caracteres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label>Senha Atual</Label>
                <Input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nova Senha</Label>
                <Input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Separator />
              <Button onClick={handleSaveSenha} disabled={savingSenha || !senhaAtual || !novaSenha || !confirmarSenha}>
                {savingSenha ? "Alterando..." : "Alterar Senha"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>Registro das suas ações recentes no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="text-center py-8 text-muted-foreground">Carregando histórico...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Nenhuma atividade registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 p-3 rounded-md border border-border bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{log.descricao}</p>
                        {log.obraNome && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            {log.obraNome}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(log.criadoEm).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs self-start">
                        {log.acao.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
