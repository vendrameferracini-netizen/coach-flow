import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { HormonalProtocol } from "@/types/domain";

export function ProtocolBoard({ protocols, readOnly = false }: { protocols: HormonalProtocol[]; readOnly?: boolean }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      {!readOnly ? (
        <Card>
          <h2 className="text-xl font-black">Protocolo Hormonal</h2>
          <p className="mt-1 text-sm text-zinc-500">Opcional e separado de treino e dieta.</p>
          <form className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Aluno"><Select><option>Lucas Andrade</option></Select></Field>
            <Field label="Medicamento"><Input placeholder="Vitamina D" /></Field>
            <Field label="Dosagem"><Input placeholder="2000 UI" /></Field>
            <Field label="Dias"><Input placeholder="Segunda a sexta" /></Field>
            <Field label="Horário"><Input type="time" /></Field>
            <Field label="Início"><Input type="date" /></Field>
            <Field label="Fim"><Input type="date" /></Field>
            <Field label="Observações"><Textarea /></Field>
            <div className="md:col-span-2"><Button type="button">Salvar protocolo</Button></div>
          </form>
        </Card>
      ) : null}
      <div className="grid gap-4">
        {protocols.map((protocol) => (
          <Card key={protocol.id} className="border-amber-200 bg-amber-50">
            <h3 className="text-xl font-black">{protocol.medicine}</h3>
            <p className="mt-2 text-sm text-amber-900">{protocol.dosage} · {protocol.days} · {protocol.time}</p>
            <p className="mt-2 text-sm text-zinc-600">Período: {formatDate(protocol.startsAt)} até {protocol.endsAt ? formatDate(protocol.endsAt) : "sem término"}</p>
            {protocol.notes ? <p className="mt-3 text-sm text-zinc-600">{protocol.notes}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
