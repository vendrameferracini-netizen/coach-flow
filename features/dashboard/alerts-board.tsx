import { BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { SmartAlert } from "@/types/domain";

const labels = {
  diet: "Dieta",
  workout: "Treino",
  assessment: "Avaliação",
  protocol: "Protocolo"
};

export function AlertsBoard({ alerts }: { alerts: SmartAlert[] }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <BellRing className="h-5 w-5 text-emerald" />
        <h2 className="text-xl font-black">Alertas inteligentes</h2>
      </div>
      <p className="mt-1 text-sm text-zinc-500">Concluir recalcula o próximo vencimento com base na frequência do aluno.</p>
      <div className="mt-5 grid gap-3">
        {alerts.length ? alerts.map((alert) => (
          <div key={alert.id} className="grid gap-3 rounded-lg border border-line p-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <strong>{alert.studentName}</strong>
                <Badge tone="warning">{labels[alert.type]}</Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-500">Vencimento {formatDate(alert.dueAt)} · {alert.daysRemaining} dias restantes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" type="button">Ver aluno</Button>
              <Button type="button">Concluir</Button>
              <Button variant="secondary" type="button">Adiar</Button>
            </div>
          </div>
        )) : <p className="rounded-lg border border-line p-4 text-sm font-semibold text-zinc-500">Nenhum alerta para hoje.</p>}
      </div>
    </Card>
  );
}
