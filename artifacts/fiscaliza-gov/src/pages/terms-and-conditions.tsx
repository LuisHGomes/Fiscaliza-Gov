import React from "react";
import { FileText, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Termos e Condições</h1>
        </div>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Aceitação dos Termos</CardTitle>
          <CardDescription>Uso do serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ao acessar e utilizar a Fiscaliza.Gov, você aceita estes termos. Caso não concorde, encerre o acesso ao sistema. Estes termos regem o uso da plataforma de gestão de obras públicas.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">2. Cadastro e Conta</CardTitle>
          <CardDescription>Criação e manutenção de conta</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>O cadastro é pessoal e não pode ser compartilhado</li>
            <li>A senha deve ser mantida em segredo e não compartilhada</li>
            <li>Informações falso ou enganoso impedem o acesso ao sistema</li>
            <li>Reclamação de acesso não autorizado deve ser comunicada imediatamente ao suporte</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">3. Uso Adequado</CardTitle>
          <CardDescription>Comportamentos proibidos</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Não utilizar dados pessoais de terceiros sem autorização</li>
            <li>Não tentar acesso não autorizado, teste de invasão ou fraude</li>
            <li>Não restringir, prejudicar ou interromper o funcionamento do sistema</li>
            <li>Não reproduzir, duplicar ou distribuir conteúdos sem autorização</li>
            <li>Não utilizar a plataforma para fins ilegais ou contra a administração pública</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">4. Responsabilidades</CardTitle>
          <CardDescription>O que a plataforma garante e o que não garante</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>A plataforma é uma ferramenta de apoio à Fiscalização de Obras Públicas</li>
            <li>Os dados inseridos são de responsabilidade do usuário e do agente público que os envia</li>
            <li>A plataforma não se responsabiliza por decisões ou diligências externas</li>
            <li>Disponibilidade: a plataforma pode sofrer manutenção preventiva com aviso prévio</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">5. Proteção de Dados</CardTitle>
          <CardDescription>Conformidade com LGPD</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            A coleta e o tratamento de dados pessoais seguem a Política de Privacidade publicada no sistema. O tratamento ocorre dentro dos limites legais aplicáveis, com base no consentimento, execução de contrato e obrigação legal.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">6. Alterações</CardTitle>
          <CardDescription>Atualizações destes termos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Estes termos podem ser alterados. As mudanças entrarão em vigor imediatamente após a publicação. O uso contínuo após a alteração implica aceitação das novas condições.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">7. Contato</CardTitle>
          <CardDescription>Dúvidas e denúncias</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>E-mail: suporte@fiscaliza.gov.br</li>
            <li>Órgão responsável: Secretaria Municipal de Fazenda Pública</li>
            <li>Para dirimir questões sobre proteção de dados, acione o canal do gestor de dados</li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>Fiscaliza.Gov - Plataforma de Gestão de Obras Públicas</p>
        <p className="mt-1">Olhar atento às regras de responsabilidade e boas práticas administrativas.</p>
      </div>
    </div>
  );
}
