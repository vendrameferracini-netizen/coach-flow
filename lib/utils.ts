import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function formatNumber(value: number, suffix = "") {
  return `${new Intl.NumberFormat("pt-BR").format(value)}${suffix}`;
}

export function calculateBmi(weight: number, height: number) {
  if (!weight || !height) return 0;
  return Number((weight / (height * height)).toFixed(1));
}
