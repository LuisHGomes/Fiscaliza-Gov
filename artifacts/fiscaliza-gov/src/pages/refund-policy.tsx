import React from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Política de Reembolso</h1>
        </div>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Aplicação</CardTitle>
          <CardDescription>O que está incluindo nos termos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta política de reembolso aplica-se ao serviço de consulta e acompanhamento de obras públicas por meio da Fiscaliza.Gov. O serviço é de acesso gratuito e não envolve pagamento de inscrição, assinatura ou transação financeira.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">2. Condições de Reembolso</CardTitle>
          <CardDescription>Quando o reembolso é aplicável</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Não há taxas de inscrição ou cobrança por acesso à plataforma</li>
            <li>Em hipótese de erro técnico que impeça o acesso ao serviço por mais de 24 horas consecutivas, o usuário pode solicitar reinício ou suporte técnico</li>
            <li>Dados cadastrais podem ser atualizados ou corrigidos a qualquer momento, sem prejuízo do acesso</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">3. Solicitacao de Reparo</CardTitle>
          <CardDescription>Como pedir correção</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Envie um e-mail para suporte@fiscaliza.gov.br com a descrição do problema</li>
            <li>Inclua: nome do usuário (se aplicável), data, descrição detalhada e capturas de tela</li>
            <li>O suporte responde em até 3 dias úteis</li>
            <li>A reparação ou acompanhamento é registrado no histórico de atendimentos</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">4. Exclusao de Cadastro</CardTitle>
          <CardDescription>Como encerrar a conta</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Usuários com perfil de cidadão podem solicitar a exclusão dos dados pessoais</li>
            <li>A solicitação deve ser feita por e-mail para suporte@fiscaliza.gov.br</li>
            <li>O envio de dados cadastrais a mais de um usuário não é permitido</li>
            <li>A exclusão é confirmada por e-mail e registrada no sistema</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">5. Limite de tempo</CardTitle>
          <CardDescription>Prazo de reclamação</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As reclamações e solicitações devem ser enviadas dentro de 30 dias após a ocorrência. Pedidos posteriores podem ser avaliados caso sejam razoáveis e aplicáveis.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">6. Contato</CardTitle>
          <CardDescription>Dúvidas sobre reembolso</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>E-mail: suporte@fiscaliza.gov.br</li>
            <li>Assunto: "Solicitação de reparo ou reembolso"</li>
            <li>Resposta em até 3 dias úteis úteis, por tela</li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Fiscaliza.Gov - Plataforma de Gestão de Obras Públicas</p>
        <p className="mt-1">Olhar atento às regras de neutralidade, transparência e boas práticas administrativas.</p>
      </div>
    </div>
  );
}
