import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { calculateBmi, formatDate } from "@/lib/utils";
import type { Assessment, Student } from "@/types/domain";

export function AssessmentBoard({ assessments, students = [], readOnly = false }: { assessments: Assessment[]; students?: Student[]; readOnly?: boolean }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      {!readOnly ? (
        <Card>
          <h2 className="text-xl font-black">Registrar avaliação</h2>
          <form className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Aluno">
              <Select disabled={!students.length}>
                {students.length ? students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                )) : <option>Nenhum aluno cadastrado</option>}
              </Select>
            </Field>
            <Field label="Peso"><Input type="number" placeholder="82" /></Field>
            <Field label="Altura"><Input placeholder="1.78" /></Field>
            <Field label="Percentual de gordura"><Input placeholder="16.8" /></Field>
            <Field label="Massa magra"><Input placeholder="68.2" /></Field>
            <Field label="Circunferências"><Textarea placeholder="Cintura, quadril, braço..." /></Field>
            <Field label="Fotos"><Input type="file" multiple /></Field>
            <Field label="Observações"><Textarea /></Field>
            <div className="md:col-span-2"><Button type="button">Salvar avaliação</Button></div>
          </form>
        </Card>
      ) : null}
      <div className="grid gap-4">
        {assessments.length ? assessments.map((assessment) => (
          <Card key={assessment.id}>
            <h3 className="text-xl font-black">{formatDate(assessment.assessedAt)}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Metric label="Peso" value={`${assessment.weight} kg`} />
              <Metric label="IMC" value={calculateBmi(assessment.weight, assessment.height)} />
              <Metric label="Gordura" value={`${assessment.bodyFat}%`} />
              <Metric label="Massa magra" value={`${assessment.leanMass} kg`} />
            </div>
            <p className="mt-4 text-sm text-zinc-500">{assessment.notes}</p>
          </Card>
        )) : <Card><p className="text-sm font-semibold text-zinc-500">Nenhuma avaliação cadastrada.</p></Card>}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-lg bg-mist p-3"><span className="text-xs font-bold uppercase text-zinc-500">{label}</span><strong className="mt-1 block">{value}</strong></div>;
}
