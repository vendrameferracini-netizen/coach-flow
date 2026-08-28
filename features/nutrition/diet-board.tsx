import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import type { Diet, Student } from "@/types/domain";

export function DietBoard({ diets, students = [], readOnly = false }: { diets: Diet[]; students?: Student[]; readOnly?: boolean }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      {!readOnly ? <Card>
        <h2 className="text-xl font-black">Cadastrar dieta</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Aluno">
            <Select disabled={!students.length}>
              {students.length ? students.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              )) : <option>Nenhum aluno cadastrado</option>}
            </Select>
          </Field>
          <Field label="Nome da dieta"><Input placeholder="Plano Hipertrofia" /></Field>
          <Field label="Refeição"><Input placeholder="Café da manhã" /></Field>
          <Field label="Horário"><Input type="time" /></Field>
          <Field label="Alimentos"><Textarea /></Field>
          <Field label="Quantidade"><Textarea /></Field>
          <Field label="Substituições"><Textarea /></Field>
          <Field label="Observações"><Textarea /></Field>
          <div className="md:col-span-2"><Button type="button">Adicionar refeição</Button></div>
        </form>
      </Card> : null}
      <div className="grid gap-4">
        {diets.length ? diets.map((diet) => (
          <Card key={diet.id}>
            <h3 className="text-xl font-black">{diet.name}</h3>
            <div className="mt-4 grid gap-3">
              {diet.meals.map((meal) => (
                <div key={meal.id} className="rounded-lg border border-line p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong>{meal.name}</strong>
                    <span className="text-sm font-bold text-emerald">{meal.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{meal.foods}</p>
                  <p className="mt-1 text-sm font-semibold">{meal.amount}</p>
                </div>
              ))}
            </div>
          </Card>
        )) : <Card><p className="text-sm font-semibold text-zinc-500">Nenhuma dieta cadastrada.</p></Card>}
      </div>
    </div>
  );
}
