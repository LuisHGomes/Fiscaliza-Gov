import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Building2, Lock, Mail } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        localStorage.setItem("fiscaliza_token", res.token);
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: err?.data?.message || "Credenciais inválidas. Tente novamente.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg mb-4 shadow-sm">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">FISCALIZA.GOV</h1>
          <p className="text-sm text-slate-500 font-medium">Plataforma de Gestão de Obras Públicas</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-center">
              Insira suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="servidor@municipio.gov.br" 
                    className="pl-9"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="senha" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-9"
                    {...form.register("senha")}
                  />
                </div>
                {form.formState.errors.senha && (
                  <p className="text-xs text-destructive">{form.formState.errors.senha.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Autenticando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center text-xs text-slate-400">
          <p>Acesso restrito a servidores e empresas autorizadas.</p>
        </div>
      </div>
    </div>
  );
}
