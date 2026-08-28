import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-white p-5 shadow-soft", className)} {...props} />;
}

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-zinc-500">{label}</p>
      <strong className="mt-3 block text-3xl text-ink">{value}</strong>
      {helper ? <span className="mt-2 block text-xs text-zinc-500">{helper}</span> : null}
    </Card>
  );
}
