import React from "react";
import { FileText, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Política de Privacidade</h1>
        </div>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Coleta de Dados</CardTitle>
          <CardDescription>Tipos de dados coletados e finalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Dados cadastrais (nome, e-mail, cargo) - necessários para autenticação e cadastro</li>
            <li>Dados de uso do sistema (logs de acesso, sessões) - para segurança e monitoramento</li>
            <li>Dados de conformidade (manifestações, observações) - para fiscalização de obras</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">2. Finalidades do Uso</CardTitle>
          <CardDescription>Como os dados são utilizados</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Autenticar usuários e gerenciar sessões</li>
            <li>Permitir acesso funcional ao sistema de fiscalização</li>
            <li>Atender a obrigações legais e regulatórias (LGPD)</li>
            <li>Melhorar a experiência e a segurança da plataforma</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">3. Base Legal e Conservação</CardTitle>
          <CardDescription>Fundamento legal e prazo de armazenamento</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Base legal: consentimento, execução de contrato e obrigação legal</li>
            <li>Conservação: dados de sessão expiram em 30 dias; dados cadastrais conservam-se conforme prazo legal</li>
            <li>Transmissão: dados não são vendidos; podem ser compartilhados com órgãos competentes quando exigido por lei</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">4. Direitos do Titular</CardTitle>
          <CardDescription>Exercício de direitos according ao LGPD</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Acesso, correção, exclusão e portabilidade de dados</li>
            <li>Opposição a tratamento e eliminação de dados pessoais</li>
            <li>Comunicação de incidentes de segurança</li>
            <li>Contato: suporte@fiscaliza.gov.br</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">5. Segurança</CardTitle>
          <CardDescription>Medidas técnicas e organizacionais</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Senhas criptografadas com bcrypt</li>
            <li>Proteção contra SQL injection com consultas parametrizadas</li>
            <li>Criptografia em trânsito (HTTPS) e armazenamento sensível</li>
            <li>Monitoramento de acesso e logs de segurança</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">6. Alterações</CardTitle>
          <CardDescription>Atualizações desta política</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta política pode ser atualizada. As alterações entram em vigor imediatamente. A versão anterior está disponível no histórico do sistema.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Fiscaliza.Gov - Plataforma de Gestão de Obras Públicas</p>
        <p className="mt-1">Olhar atento às obrigações legais e regulatórias aplicáveis.</p>
      </div>
    </div>
  );
}
