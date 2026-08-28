import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Message } from "@/types/domain";

export function MessageBoard({ messages, readOnly = false }: { messages: Message[]; readOnly?: boolean }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      {!readOnly ? (
        <Card>
          <h2 className="text-xl font-black">Enviar recado</h2>
          <form className="mt-5 grid gap-4">
            <Field label="Aluno"><Select><option>Lucas Andrade</option></Select></Field>
            <Field label="Título"><Input placeholder="Ajuste no treino" /></Field>
            <Field label="Mensagem"><Textarea placeholder="Escreva o recado para o aluno..." /></Field>
            <Button type="button">Enviar recado</Button>
          </form>
        </Card>
      ) : null}
      <Card>
        <h2 className="text-xl font-black">Recados</h2>
        <div className="mt-4 grid gap-3">
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border border-line p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong>{message.title}</strong>
                  <p className="mt-1 text-sm text-zinc-500">{message.body}</p>
                </div>
                <Badge tone={message.readAt ? "success" : "warning"}>{message.readAt ? "Lido" : "Não lido"}</Badge>
              </div>
              <span className="mt-3 block text-xs font-semibold text-zinc-500">{formatDate(message.sentAt)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
