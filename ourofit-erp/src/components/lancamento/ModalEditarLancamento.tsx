"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, ChevronUp, Check, Trash2, AlertTriangle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

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

interface ModalEditarLancamentoProps {
  lancamento: Lancamento;
  categorias: Categoria[];
  onClose: () => void;
  onSucesso?: () => void;
}

const CONTAS = [
  "Stone", "Bradesco PJ", "Nextfit", "Gympass", "Totalpass", "Caixa Físico", "Pix Direto",
];

export function ModalEditarLancamento({
  lancamento,
  categorias,
  onClose,
  onSucesso,
}: ModalEditarLancamentoProps) {
  const router = useRouter();
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">(lancamento.tipo);
  const [categoriaId, setCategoriaId] = useState(lancamento.categoriaId);
  const [valor, setValor] = useState(
    lancamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  );
  const [data, setData] = useState(lancamento.data.split("T")[0]);
  const [descricao, setDescricao] = useState(lancamento.descricao ?? "");
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [fornecedor, setFornecedor] = useState(lancamento.fornecedor ?? "");
  const [conta, setConta] = useState(lancamento.conta ?? "");
  const [observacao, setObservacao] = useState(lancamento.observacao ?? "");
  const [status, setStatus] = useState<"PAGO" | "EM_ABERTO" | "AGENDADO">(lancamento.status);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  function formatarValor(raw: string): string {
    const numeros = raw.replace(/\D/g, "");
    if (!numeros) return "";
    const centavos = parseInt(numeros, 10);
    return (centavos / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function valorNumerico(): number {
    return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  }

  function handleTipoChange(novoTipo: "ENTRADA" | "SAIDA") {
    setTipo(novoTipo);
    setCategoriaId("");
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!categoriaId || valorNumerico() <= 0 || !data) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch(`/api/lancamentos/${lancamento.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo, categoriaId, valor: valorNumerico(), data,
          descricao: descricao || null,
          fornecedor: fornecedor || null,
          conta: conta || null,
          observacao: observacao || null,
          status,
        }),
      });
      if (!res.ok) throw new Error();
      onSucesso?.();
      router.refresh();
      onClose();
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    setExcluindo(true);
    try {
      const res = await fetch(`/api/lancamentos/${lancamento.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onSucesso?.();
      router.refresh();
      onClose();
    } catch {
      setErro("Erro ao excluir. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[hsl(222,47%,9%)] border border-white/10 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-semibold text-white">Editar Lançamento</h2>
            <p className="text-xs text-white/30 mt-0.5">{lancamento.categoria.nome} · {formatCurrency(lancamento.valor)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Confirmação de exclusão */}
        {confirmarExclusao ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Excluir lançamento?</p>
              <p className="text-sm text-white/40 mt-1">Essa ação não pode ser desfeita.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExclusao(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                disabled={excluindo}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-400 text-white transition-colors flex items-center justify-center gap-2"
              >
                {excluindo ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Trash2 className="w-4 h-4" />}
                {excluindo ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSalvar} className="p-6 space-y-4">
            {/* Toggle ENTRADA / SAÍDA */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
              <button type="button" onClick={() => handleTipoChange("ENTRADA")} className={cn("py-2.5 rounded-lg text-sm font-semibold transition-all", tipo === "ENTRADA" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-white/40 hover:text-white/70")}>
                💚 Entrada
              </button>
              <button type="button" onClick={() => handleTipoChange("SAIDA")} className={cn("py-2.5 rounded-lg text-sm font-semibold transition-all", tipo === "SAIDA" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "text-white/40 hover:text-white/70")}>
                🔴 Saída
              </button>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Categoria <span className="text-rose-400">*</span></label>
              <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors">
                <option value="" className="bg-[hsl(222,47%,9%)] text-white/50">Selecione...</option>
                {categoriasFiltradas.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[hsl(222,47%,9%)] text-white">{c.nome}</option>
                ))}
              </select>
            </div>

            {/* Valor */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Valor <span className="text-rose-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">R$</span>
                <input type="text" inputMode="numeric" value={valor} onChange={(e) => setValor(formatarValor(e.target.value))} placeholder="0,00" className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors tabular-nums" />
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Data <span className="text-rose-400">*</span></label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Descrição <span className="text-white/25 font-normal">(opcional)</span></label>
              <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors" />
            </div>

            {/* Mais detalhes */}
            <div>
              <button type="button" onClick={() => setMostrarDetalhes(!mostrarDetalhes)} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors w-full text-left">
                {mostrarDetalhes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {mostrarDetalhes ? "Ocultar detalhes" : "Mais detalhes (conta, status...)"}
              </button>
              {mostrarDetalhes && (
                <div className="mt-3 space-y-3 pl-4 border-l border-white/5">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Conta</label>
                    <select value={conta} onChange={(e) => setConta(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors">
                      <option value="" className="bg-[hsl(222,47%,9%)]">Não especificar</option>
                      {CONTAS.map((c) => <option key={c} value={c} className="bg-[hsl(222,47%,9%)] text-white">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Status</label>
                    <div className="flex gap-2">
                      {(["PAGO", "EM_ABERTO", "AGENDADO"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => setStatus(s)} className={cn("flex-1 py-2 rounded-lg text-xs font-medium transition-all border", status === s ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-white/5 bg-white/5 text-white/30 hover:text-white/60")}>
                          {s === "PAGO" ? "Pago" : s === "EM_ABERTO" ? "Em Aberto" : "Agendado"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Fornecedor / Cliente</label>
                    <input type="text" value={fornecedor} onChange={(e) => setFornecedor(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors" />
                  </div>
                </div>
              )}
            </div>

            {erro && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setConfirmarExclusao(true)} className="p-2.5 rounded-xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={salvando} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all", tipo === "ENTRADA" ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-rose-500 hover:bg-rose-400 text-white", salvando && "opacity-60 cursor-not-allowed")}>
                {salvando ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : <Check className="w-4 h-4" />}
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
