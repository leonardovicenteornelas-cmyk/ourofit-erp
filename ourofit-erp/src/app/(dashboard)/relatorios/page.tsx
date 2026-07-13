"use client";

import { useEffect, useState } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { BarChart2, Loader2, AlertCircle, Calendar } from "lucide-react";

interface DREData {
  entradas: { [nome: string]: number };
  saidas: { [nome: string]: number };
  totalEntradas: number;
  totalSaidas: number;
}

interface ResumoResponse {
  dre: DREData;
}

const MESES = [
  { value: "2026-06", label: "Junho / 2026" },
  { value: "2026-05", label: "Maio / 2026" },
  { value: "2026-04", label: "Abril / 2026" },
  { value: "2026-03", label: "Março / 2026" },
  { value: "2026-02", label: "Fevereiro / 2026" },
  { value: "2026-01", label: "Janeiro / 2026" },
];

export default function RelatoriosPage() {
  const [mesRef, setMesRef] = useState("2026-06");
  const [data, setData] = useState<DREData | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<"resultado" | "fluxo">("resultado");

  useEffect(() => {
    async function carregarDRE() {
      try {
        setLoading(true);
        const res = await fetch(`/api/resumo?mes=${mesRef}`);
        if (!res.ok) throw new Error();
        const json: ResumoResponse = await res.json();
        setData(json.dre);
      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDRE();
  }, [mesRef]);

  const ebitda = data ? data.totalEntradas - data.totalSaidas : 0;
  const ebitdaMargem = data && data.totalEntradas > 0 ? (ebitda / data.totalEntradas) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios Financeiros</h1>
          <p className="text-sm text-white/40 mt-0.5 font-medium">
            Demonstrativos consolidados por período
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/20" />
          <select
            value={mesRef}
            onChange={(e) => setMesRef(e.target.value)}
            className="px-3 py-2 text-sm text-white bg-[hsl(222,47%,9%)] border border-white/5 rounded-xl hover:border-white/10 focus:outline-none cursor-pointer font-medium transition-colors"
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value} className="bg-[hsl(222,47%,9%)]">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setAbaAtiva("resultado")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer",
            abaAtiva === "resultado"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-white/40 hover:text-white/60"
          )}
        >
          Demonstrativo de Resultado (DRE)
        </button>
        <button
          onClick={() => setAbaAtiva("fluxo")}
          className={cn(
            "px-4 py-2.5 text-sm font-semibold transition-all border-b-2 cursor-pointer",
            abaAtiva === "fluxo"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-white/40 hover:text-white/60"
          )}
        >
          Fluxo de Caixa Mensal (DFC)
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-white/40">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs">Gerando relatório consolidado...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {abaAtiva === "resultado" ? (
            // DRE simplificada sem jargões contábeis complexos
            <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Demonstrativo de Resultado do Exercício</h3>
                <p className="text-xs text-white/30 mt-0.5">Competência consolidada do mês selecionado</p>
              </div>

              {/* Tabela de DRE */}
              <div className="space-y-4 text-sm">
                {/* ENTRADAS */}
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-white/5 pb-1 text-xs font-bold text-white/40 uppercase tracking-wider">
                    <span>Entradas (Faturamento)</span>
                    <span>Valor Real</span>
                  </div>
                  {Object.entries(data.entradas).map(([nome, valor]) => (
                    <div key={nome} className="flex justify-between text-white/70 py-1 pl-2 border-l border-emerald-500/20">
                      <span>{nome}</span>
                      <span className="font-medium tabular-nums">{formatCurrency(valor)}</span>
                    </div>
                  ))}
                  {Object.keys(data.entradas).length === 0 && (
                    <p className="text-xs text-white/20 italic pl-2">Sem faturamento registrado.</p>
                  )}
                  <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-white/5">
                    <span>RECEITA BRUTA TOTAL</span>
                    <span className="tabular-nums">{formatCurrency(data.totalEntradas)}</span>
                  </div>
                </div>

                {/* SAÍDAS */}
                <div className="space-y-2 pt-4">
                  <div className="flex justify-between border-b border-white/5 pb-1 text-xs font-bold text-white/40 uppercase tracking-wider">
                    <span>Saídas (Custos e Despesas)</span>
                    <span>Valor Real</span>
                  </div>
                  {Object.entries(data.saidas).map(([nome, valor]) => (
                    <div key={nome} className="flex justify-between text-white/70 py-1 pl-2 border-l border-rose-500/20">
                      <span>{nome}</span>
                      <span className="font-medium tabular-nums">{formatCurrency(valor)}</span>
                    </div>
                  ))}
                  {Object.keys(data.saidas).length === 0 && (
                    <p className="text-xs text-white/20 italic pl-2">Sem despesas registradas.</p>
                  )}
                  <div className="flex justify-between font-bold text-rose-400 pt-1 border-t border-white/5">
                    <span>DESPESAS OPERACIONAIS TOTAIS</span>
                    <span className="tabular-nums">{formatCurrency(data.totalSaidas)}</span>
                  </div>
                </div>

                {/* RESULTADO FINAL */}
                <div className="space-y-2 pt-6 border-t border-white/10">
                  <div className="flex justify-between font-bold text-base text-white">
                    <span>RESULTADO OPERACIONAL (EBITDA)</span>
                    <span className={cn("tabular-nums", ebitda >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {formatCurrency(ebitda)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-amber-400">
                    <span>MARGEM OPERACIONAL (EBITDA %)</span>
                    <span>{ebitdaMargem.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // DFC simplificado
            <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Fluxo de Caixa Diário Consolidado</h3>
                <p className="text-xs text-white/30 mt-0.5">Visão de movimentações financeiras de caixa e saldo</p>
              </div>

              {/* Resumo Caixa */}
              <div className="grid grid-cols-3 gap-4 border border-white/5 rounded-xl p-4 bg-white/[0.02]">
                <div>
                  <p className="text-xs text-white/30 font-medium">Entradas de Caixa</p>
                  <p className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">+{formatCurrency(data.totalEntradas)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-medium">Saídas de Caixa</p>
                  <p className="text-lg font-bold text-rose-400 mt-1 tabular-nums">-{formatCurrency(data.totalSaidas)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/30 font-medium">Geração Líquida de Caixa</p>
                  <p className={cn("text-lg font-bold mt-1 tabular-nums", ebitda >= 0 ? "text-emerald-400" : "text-rose-400")}>
                    {ebitda >= 0 ? "+" : ""}{formatCurrency(ebitda)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-3 flex gap-3 items-center">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300/80 leading-normal">
                  Esta aba reflete as datas reais em que o dinheiro movimentou nas contas. No modelo simplificado da Fase 1, as despesas operacionais sem especificação de data de competência diferente são apresentadas de forma equivalente à DRE para facilitar a conciliação imediata da planilha.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs">Não foi possível carregar relatórios para o período selecionado.</p>
        </div>
      )}
    </div>
  );
}
