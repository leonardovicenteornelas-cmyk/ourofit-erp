"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  AlertCircle,
  Calendar,
  Loader2,
} from "lucide-react";
import { KpiCard } from "@/components/financeiro/KpiCard";
import { GraficoEvolucao } from "@/components/financeiro/GraficoEvolucao";
import { formatCurrency, formatDate, MESES_COMPLETOS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface KPI {
  receitaMes: number;
  despesasMes: number;
  resultadoMes: number;
  saldoAtual: number;
  receitaMesAnt: number;
  despesasMesAnt: number;
  resultadoMesAnt: number;
}

interface Lancamento {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
  data: string;
  descricao: string;
  categoria: string;
}

interface GraficoDado {
  mes: number;
  ano: number;
  label: string;
  receita: number;
  despesa: number;
  resultado: number;
}

interface ResumoData {
  kpis: KPI;
  grafico: GraficoDado[];
  ultimosLancamentos: Lancamento[];
}

export default function DashboardPage() {
  const [data, setData] = useState<ResumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const mesAtual = MESES_COMPLETOS[new Date().getMonth()];
  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    async function carregarResumo() {
      try {
        setLoading(true);
        // Usando o mês de Setembro de 2025 por padrão para exibir o histórico real importado
        const res = await fetch("/api/resumo?mes=2025-09");
        if (!res.ok) throw new Error("Falha ao buscar dados");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar resumo financeiro.");
      } finally {
        setLoading(false);
      }
    }
    carregarResumo();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-white/50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Carregando resumo do ERP...</p>
      </div>
    );
  }

  if (erro || !data) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-400">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs">{erro || "Dados indisponíveis no momento."}</p>
      </div>
    );
  }

  const { kpis, grafico, ultimosLancamentos } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
          <p className="text-sm text-white/40 mt-0.5 font-medium">
            {mesAtual} de {anoAtual} · Academia Ourofit
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/40 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>Dados em Tempo Real (Supabase)</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          titulo="Receitas do Mês"
          valor={kpis.receitaMes}
          valorAnterior={kpis.receitaMesAnt}
          icon={TrendingUp}
          tipo="entrada"
          delay={0}
        />
        <KpiCard
          titulo="Saídas do Mês"
          valor={kpis.despesasMes}
          valorAnterior={kpis.despesasMesAnt}
          icon={TrendingDown}
          tipo="saida"
          delay={80}
        />
        <KpiCard
          titulo="Resultado Operacional"
          valor={kpis.resultadoMes}
          valorAnterior={kpis.resultadoMesAnt}
          icon={DollarSign}
          tipo="resultado"
          descricao={`EBITDA ${
            kpis.receitaMes > 0
              ? ((kpis.resultadoMes / kpis.receitaMes) * 100).toFixed(1)
              : "0.0"
          }%`}
          delay={160}
        />
        <KpiCard
          titulo="Saldo em Caixa"
          valor={kpis.saldoAtual}
          valorAnterior={kpis.saldoAtual}
          icon={Wallet}
          tipo="neutro"
          delay={240}
        />
      </div>

      {/* Gráfico + Últimos lançamentos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Gráfico de evolução (ocupa 2/3) */}
        <div className="xl:col-span-2 animate-fade-in" style={{ animationDelay: "320ms" }}>
          <GraficoEvolucao data={grafico} />
        </div>

        {/* Últimos lançamentos (ocupa 1/3) */}
        <div
          className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5 animate-fade-in"
          style={{ animationDelay: "400ms" }}
        >
          <h3 className="text-sm font-semibold text-white/70 mb-4">Últimos Lançamentos</h3>
          <div className="space-y-3">
            {ultimosLancamentos.map((l) => (
              <div key={l.id} className="flex items-center gap-3 group">
                <div
                  className={cn(
                    "w-1.5 h-8 rounded-full flex-shrink-0",
                    l.tipo === "ENTRADA" ? "bg-emerald-500" : "bg-rose-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/80 truncate">{l.descricao}</p>
                  <p className="text-[11px] text-white/30">{formatDate(new Date(l.data))}</p>
                </div>
                <p
                  className={cn(
                    "text-xs font-bold flex-shrink-0",
                    l.tipo === "ENTRADA" ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {l.tipo === "SAIDA" ? "−" : "+"}
                  {formatCurrency(l.valor)}
                </p>
              </div>
            ))}
            {ultimosLancamentos.length === 0 && (
              <p className="text-xs text-white/20 text-center py-4">Nenhum lançamento recente.</p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-white/5">
            <a
              href="/lancamentos"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Ver todos os lançamentos →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
