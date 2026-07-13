import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes do Tailwind de forma segura, sem conflitos.
 * Padrão Shadcn/UI — usado em todos os componentes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um número como moeda brasileira (BRL).
 * Ex: 1234.5 → "R$ 1.234,50"
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Formata uma data para o padrão brasileiro.
 * Ex: new Date("2025-04-01") → "01/04/2025"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata uma data mostrando mês e ano por extenso.
 * Ex: new Date("2025-04-01") → "Abril 2025"
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

/**
 * Retorna o nome do mês abreviado a partir de um número (1–12).
 * Ex: 4 → "Abr"
 */
export const MESES_ABREVIADOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const MESES_COMPLETOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/**
 * Calcula a variação percentual entre dois valores.
 * Ex: variacao(100, 120) → "+20,00%"
 */
export function formatVariacao(anterior: number, atual: number): string {
  if (anterior === 0) return "-";
  const pct = ((atual - anterior) / Math.abs(anterior)) * 100;
  const sinal = pct >= 0 ? "+" : "";
  return `${sinal}${pct.toFixed(2).replace(".", ",")}%`;
}

/**
 * Retorna a classe de cor baseada no tipo de lançamento.
 */
export function corTipo(tipo: "ENTRADA" | "SAIDA"): string {
  return tipo === "ENTRADA" ? "text-emerald-400" : "text-rose-400";
}

/**
 * Retorna a classe de cor baseada no status do pagamento.
 */
export function corStatus(status: "PAGO" | "EM_ABERTO" | "CANCELADO" | "AGENDADO"): string {
  const mapa = {
    PAGO: "text-emerald-400",
    EM_ABERTO: "text-amber-400",
    CANCELADO: "text-zinc-500",
    AGENDADO: "text-sky-400",
  };
  return mapa[status] ?? "text-zinc-400";
}
