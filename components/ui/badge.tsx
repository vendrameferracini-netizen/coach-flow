import { cn } from "@/lib/utils";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald/10 text-emerald",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-700"
  };

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", tones[tone])}>{children}</span>;
}
