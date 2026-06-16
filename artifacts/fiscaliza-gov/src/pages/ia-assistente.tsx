import React, { useState, useRef, useEffect } from "react";
import { useChatAssistente } from "@workspace/api-client-react";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Mensagem {
  id: string;
  de: "usuario" | "assistente";
  texto: string;
  hora: Date;
}

const SUGESTOES = [
  "Quais obras estão atrasadas?",
  "Quantas obras estão em execução?",
  "Qual o valor total investido em obras?",
  "Há obras com risco elevado?",
  "Obras concluídas este ano?",
];

export default function IAAssistente() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: "welcome",
      de: "assistente",
      texto: "Olá! Sou o assistente de gestão do FISCALIZA.GOV. Posso ajudar com informações sobre as obras do município — andamento, valores, atrasos, riscos e muito mais. Como posso ajudar?",
      hora: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const chatMutation = useChatAssistente();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviar = (texto: string = input) => {
    if (!texto.trim()) return;

    const userMsg: Mensagem = {
      id: Date.now().toString(),
      de: "usuario",
      texto: texto.trim(),
      hora: new Date(),
    };
    setMensagens((prev) => [...prev, userMsg]);
    setInput("");

    chatMutation.mutate(
      { data: { mensagem: texto.trim() } },
      {
        onSuccess: (data: any) => {
          const resp: Mensagem = {
            id: (Date.now() + 1).toString(),
            de: "assistente",
            texto: data.resposta,
            hora: new Date(),
          };
          setMensagens((prev) => [...prev, resp]);
        },
        onError: () => {
          const errMsg: Mensagem = {
            id: (Date.now() + 1).toString(),
            de: "assistente",
            texto: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
            hora: new Date(),
          };
          setMensagens((prev) => [...prev, errMsg]);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IA Assistente</h1>
            <p className="text-slate-500 text-sm">Consultas inteligentes sobre obras públicas municipais</p>
          </div>
        </div>
      </div>

      <Card className="flex flex-col h-[calc(100vh-280px)]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensagens.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.de === "usuario" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.de === "assistente" ? "bg-primary/10" : "bg-slate-200"
              }`}>
                {msg.de === "assistente"
                  ? <Bot className="w-4 h-4 text-primary" />
                  : <User className="w-4 h-4 text-slate-600" />
                }
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.de === "assistente"
                  ? "bg-slate-100 text-slate-800 rounded-tl-none"
                  : "bg-primary text-white rounded-tr-none"
              }`}>
                {msg.texto}
                <div className={`text-xs mt-1 ${msg.de === "assistente" ? "text-slate-400" : "text-white/60"}`}>
                  {msg.hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          {mensagens.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-600 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
              placeholder="Pergunte sobre obras, valores, prazos..."
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button onClick={() => enviar()} disabled={chatMutation.isPending || !input.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
