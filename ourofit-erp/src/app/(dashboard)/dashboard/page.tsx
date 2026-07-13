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
import { formatCurrency, formatDate, cn } from "@/lib/utils";

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

interface DREData {
  entradas: { [nome: string]: number };
  saidas: { [nome: string]: number };
  totalEntradas: number;
  totalSaidas: number;
}

interface ResumoData {
  kpis: KPI;
  grafico: GraficoDado[];
  ultimosLancamentos: Lancamento[];
  dre: DREData;
}

const MESES = [
  { value: "2026-07", label: "Julho / 2026" },
  { value: "2026-06", label: "Junho / 2026" },
  { value: "2026-05", label: "Maio / 2026" },
  { value: "2026-04", label: "Abril / 2026" },
  { value: "2026-03", label: "Março / 2026" },
  { value: "2026-02", label: "Fevereiro / 2026" },
  { value: "2026-01", label: "Janeiro / 2026" },
];

export default function DashboardPage() {
  const [mesRef, setMesRef] = useState("2026-07");
  const [data, setData] = useState<ResumoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const labelMesSelecionado = MESES.find((m) => m.value === mesRef)?.label || mesRef;

  useEffect(() => {
    async function carregarResumo() {
      try {
        setLoading(true);
        const res = await fetch(`/api/resumo?mes=${mesRef}`);
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
  }, [mesRef]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-white/50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Carregando dados do ERP...</p>
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

  const { kpis, grafico, ultimosLancamentos, dre } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Controle</h1>
          <p className="text-sm text-white/40 mt-0.5 font-medium">
            Período: {labelMesSelecionado} · Academia Ourofit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/20" />
          <select
            value={mesRef}
            onChange={(e) => setMesRef(e.target.value)}
            className="px-3 py-2 text-sm text-white bg-[hsl(222,47%,9%)] border border-white/5 rounded-xl hover:border-white/10 focus:outline-none cursor-pointer font-semibold transition-colors"
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[hsl(222,47%,9%)]">
                {m.label}
              </option>
            ))}
          </select>
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

      {/* DADOS DETALHADOS (Similares à Planilha) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Entradas */}
        <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5">
          <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center justify-between">
            <span>Demonstrativo de Receitas</span>
            <span className="text-xs text-white/40 font-medium">Regime de Caixa</span>
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(dre.entradas).map(([categoria, valor]) => (
              <div key={categoria} className="flex justify-between text-xs py-1.5 border-b border-white/5 hover:bg-white/2 px-2 rounded transition-colors">
                <span className="text-white/70 font-medium">{categoria}</span>
                <span className="text-white font-bold">{formatCurrency(valor)}</span>
              </div>
            ))}
            {Object.keys(dre.entradas).length === 0 && (
              <p className="text-xs text-white/20 py-4 text-center">Nenhuma receita registrada.</p>
            )}
          </div>
          <div className="flex justify-between text-xs pt-3 mt-3 border-t-2 border-white/10 font-bold text-white px-2">
            <span>TOTAL RECEITAS</span>
            <span className="text-emerald-400">{formatCurrency(dre.totalEntradas)}</span>
          </div>
        </div>

        {/* Saídas */}
        <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5">
          <h3 className="text-sm font-semibold text-rose-400 mb-4 flex items-center justify-between">
            <span>Demonstrativo de Despesas</span>
            <span className="text-xs text-white/40 font-medium">Regime de Caixa</span>
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {Object.entries(dre.saidas).map(([categoria, valor]) => (
              <div key={categoria} className="flex justify-between text-xs py-1.5 border-b border-white/5 hover:bg-white/2 px-2 rounded transition-colors">
                <span className="text-white/70 font-medium">{categoria}</span>
                <span className="text-white font-bold">{formatCurrency(valor)}</span>
              </div>
            ))}
            {Object.keys(dre.saidas).length === 0 && (
              <p className="text-xs text-white/20 py-4 text-center">Nenhuma despesa registrada.</p>
            )}
          </div>
          <div className="flex justify-between text-xs pt-3 mt-3 border-t-2 border-white/10 font-bold text-white px-2">
            <span>TOTAL DESPESAS</span>
            <span className="text-rose-400">{formatCurrency(dre.totalSaidas)}</span>
          </div>
        </div>
      </div>

      {/* Gráfico + Últimos lançamentos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Gráfico de evolução */}
        <div className="xl:col-span-2">
          <GraficoEvolucao data={grafico} />
        </div>

        {/* Últimos lançamentos */}
        <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-5">
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
