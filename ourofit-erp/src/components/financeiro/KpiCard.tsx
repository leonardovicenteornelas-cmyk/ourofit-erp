import { cn, formatCurrency, formatVariacao } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  titulo: string;
  valor: number;
  valorAnterior?: number;
  icon: LucideIcon;
  tipo?: "entrada" | "saida" | "neutro" | "resultado";
  prefixo?: string;
  sufixo?: string;
  descricao?: string;
  delay?: number;
}

export function KpiCard({
  titulo,
  valor,
  valorAnterior,
  icon: Icon,
  tipo = "neutro",
  prefixo,
  sufixo,
  descricao,
  delay = 0,
}: KpiCardProps) {
  const variacao = valorAnterior !== undefined ? valor - valorAnterior : null;
  const pct = valorAnterior !== undefined ? formatVariacao(valorAnterior, valor) : null;
  const subindo = variacao !== null && variacao > 0;
  const descendo = variacao !== null && variacao < 0;

  const corBorda = {
    entrada: "border-emerald-500/20",
    saida: "border-rose-500/20",
    neutro: "border-white/5",
    resultado: valor >= 0 ? "border-emerald-500/20" : "border-rose-500/20",
  }[tipo];

  const corIcon = {
    entrada: "bg-emerald-500/10 text-emerald-400",
    saida: "bg-rose-500/10 text-rose-400",
    neutro: "bg-amber-500/10 text-amber-400",
    resultado: valor >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400",
  }[tipo];

  const corValor = {
    entrada: "text-emerald-400",
    saida: "text-rose-400",
    neutro: "text-white",
    resultado: valor >= 0 ? "text-emerald-400" : "text-rose-400",
  }[tipo];

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-[hsl(222,47%,9%)] p-5 transition-all duration-300",
        "hover:bg-[hsl(222,47%,11%)] hover:shadow-lg hover:-translate-y-0.5",
        "animate-fade-in",
        corBorda
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow de fundo sutil */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300",
          tipo === "entrada" && "bg-gradient-to-br from-emerald-500/3 to-transparent",
          tipo === "saida" && "bg-gradient-to-br from-rose-500/3 to-transparent",
          tipo === "neutro" && "bg-gradient-to-br from-amber-500/3 to-transparent",
        )}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">
            {titulo}
          </p>
          <p className={cn("text-2xl font-bold tracking-tight", corValor)}>
            {prefixo}
            {typeof valor === "number" ? formatCurrency(valor) : valor}
            {sufixo}
          </p>
          {descricao && (
            <p className="text-xs text-white/30 mt-1">{descricao}</p>
          )}
          {pct && variacao !== null && (
            <div className="flex items-center gap-1 mt-2">
              {subindo ? (
                <TrendingUp className="w-3 h-3 text-emerald-400" />
              ) : descendo ? (
                <TrendingDown className="w-3 h-3 text-rose-400" />
              ) : (
                <Minus className="w-3 h-3 text-white/30" />
              )}
              <span
                className={cn(
                  "text-xs font-semibold",
                  subindo ? "text-emerald-400" : descendo ? "text-rose-400" : "text-white/30"
                )}
              >
                {pct}
              </span>
              <span className="text-xs text-white/25">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0", corIcon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
