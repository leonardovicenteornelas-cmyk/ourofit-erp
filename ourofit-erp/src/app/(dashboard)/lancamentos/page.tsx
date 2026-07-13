"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { STATUS_LABELS, TIPO_LABELS } from "@/types";
import { ArrowUpDown, Filter, Plus, Search, Loader2 } from "lucide-react";
import { ModalNovoLancamento } from "@/components/lancamento/ModalNovoLancamento";
import { ModalEditarLancamento } from "@/components/lancamento/ModalEditarLancamento";

interface Categoria {
  id: string;
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
  icone: string;
}

interface Lancamento {
  id: string;
  tipo: "ENTRADA" | "SAIDA";
  categoriaId: string;
  valor: number;
  data: string;
  descricao?: string | null;
  fornecedor?: string | null;
  conta?: string | null;
  observacao?: string | null;
  status: "PAGO" | "EM_ABERTO" | "AGENDADO";
  categoria: { nome: string; icone: string };
}

export default function LancamentosPage() {
  // Lançamentos e Categorias
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [lancamentoParaEditar, setLancamentoParaEditar] = useState<Lancamento | null>(null);

  // Estados de Filtros e Busca
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  async function carregarDados() {
    try {
      setLoading(true);
      
      // Monta query string com filtros ativos
      const params = new URLSearchParams();
      if (busca) params.append("busca", busca);
      if (filtroTipo) params.append("tipo", filtroTipo);
      if (filtroStatus) params.append("status", filtroStatus);

      const [resLancamentos, resCategorias] = await Promise.all([
        fetch(`/api/lancamentos?${params.toString()}`),
        fetch("/api/categorias")
      ]);

      if (resLancamentos.ok && resCategorias.ok) {
        const dataL = await resLancamentos.json();
        const dataC = await resCategorias.json();
        setLancamentos(dataL.lancamentos);
        setCategorias(dataC);
      }
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [filtroTipo, filtroStatus]);

  // Handler de busca com debounce simples ou tecla Enter/botão fora
  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    carregarDados();
  };

  const totalEntradas = lancamentos
    .filter((l) => l.tipo === "ENTRADA" && l.status === "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const totalSaidas = lancamentos
    .filter((l) => l.tipo === "SAIDA" && l.status === "PAGO")
    .reduce((s, l) => s + Number(l.valor), 0);
  const emAberto = lancamentos
    .filter((l) => l.status === "EM_ABERTO")
    .reduce((s, l) => s + Number(l.valor), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lançamentos</h1>
          <p className="text-sm text-white/40 mt-0.5 font-medium">
            {lancamentos.length} registros cadastrados
          </p>
        </div>
        <button
          onClick={() => setModalNovoAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold transition-all hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Resumo rápido */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entradas (pagas)", valor: totalEntradas, cor: "text-emerald-400", borda: "border-emerald-500/20" },
          { label: "Saídas (pagas)", valor: totalSaidas, cor: "text-rose-400", borda: "border-rose-500/20" },
          { label: "Em Aberto", valor: emAberto, cor: "text-amber-400", borda: "border-amber-500/20" },
        ].map((item) => (
          <div key={item.label} className={cn("rounded-xl border bg-[hsl(222,47%,9%)] px-4 py-3", item.borda)}>
            <p className="text-xs text-white/30 font-semibold mb-1">{item.label}</p>
            <p className={cn("text-lg font-bold tabular-nums", item.cor)}>{formatCurrency(item.valor)}</p>
          </div>
        ))}
      </div>

      {/* Filtros e Busca */}
      <form onSubmit={handleBuscaSubmit} className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Buscar por descrição, fornecedor... (Pressione Enter)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[hsl(222,47%,9%)] border border-white/5 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors font-semibold"
        >
          Buscar
        </button>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 text-sm text-white/50 bg-[hsl(222,47%,9%)] border border-white/5 rounded-xl hover:border-white/10 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="">Todos os tipos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SAIDA">Saídas</option>
        </select>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-3 py-2.5 text-sm text-white/50 bg-[hsl(222,47%,9%)] border border-white/5 rounded-xl hover:border-white/10 focus:outline-none cursor-pointer transition-colors"
        >
          <option value="">Todos os status</option>
          <option value="PAGO">Pago</option>
          <option value="EM_ABERTO">Em Aberto</option>
          <option value="AGENDADO">Agendado</option>
        </select>
      </form>

      {/* Tabela de Lançamentos */}
      <div className="rounded-xl border border-white/5 bg-[hsl(222,47%,9%)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <p className="text-xs">Buscando lançamentos...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Data", "Descrição", "Categoria", "Conta", "Tipo", "Status", "Valor"].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "py-3 px-4 text-xs font-semibold text-white/30 uppercase tracking-wider",
                      h === "Valor" ? "text-right" : "text-left"
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {lancamentos.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setLancamentoParaEditar(l)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-white/40 font-mono text-xs tabular-nums whitespace-nowrap">
                    {formatDate(new Date(l.data))}
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-white/80 font-medium group-hover:text-white transition-colors">
                      {l.descricao || l.categoria.nome}
                    </p>
                    {l.fornecedor && (
                      <p className="text-xs text-white/25 mt-0.5">{l.fornecedor}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-white/40 text-xs">{l.categoria.nome}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-md font-medium">
                      {l.conta || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-md",
                        l.tipo === "ENTRADA"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      )}
                    >
                      {TIPO_LABELS[l.tipo]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-md",
                        l.status === "PAGO"
                          ? "bg-white/5 text-white/40"
                          : l.status === "EM_ABERTO"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      )}
                    >
                      {STATUS_LABELS[l.status]}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-3 px-4 text-right font-bold tabular-nums",
                      l.tipo === "ENTRADA" ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {l.tipo === "SAIDA" ? "−" : "+"}
                    {formatCurrency(l.valor)}
                  </td>
                </tr>
              ))}
              {lancamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/25 text-xs">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modais dinâmicos */}
      {modalNovoAberto && (
        <ModalNovoLancamento
          categorias={categorias}
          onClose={() => setModalNovoAberto(false)}
          onSucesso={carregarDados}
        />
      )}

      {lancamentoParaEditar && (
        <ModalEditarLancamento
          lancamento={lancamentoParaEditar}
          categorias={categorias}
          onClose={() => setLancamentoParaEditar(null)}
          onSucesso={carregarDados}
        />
      )}
    </div>
  );
}
