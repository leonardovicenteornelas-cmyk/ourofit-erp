"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Categoria {
  id: string;
  nome: string;
  tipo: "ENTRADA" | "SAIDA";
  icone: string;
}

interface ModalNovoLancamentoProps {
  categorias: Categoria[];
  onClose: () => void;
  onSucesso?: () => void;
}

const CONTAS = [
  "Stone",
  "Bradesco PJ",
  "Nextfit",
  "Gympass",
  "Totalpass",
  "Caixa Físico",
  "Pix Direto",
];

export function ModalNovoLancamento({
  categorias,
  onClose,
  onSucesso,
}: ModalNovoLancamentoProps) {
  const router = useRouter();

  // ─── Estado do formulário ───────────────────────────────────────
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [categoriaId, setCategoriaId] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => {
    const hoje = new Date();
    return hoje.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [descricao, setDescricao] = useState("");
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [fornecedor, setFornecedor] = useState("");
  const [conta, setConta] = useState("");
  const [observacao, setObservacao] = useState("");
  const [status, setStatus] = useState<"PAGO" | "EM_ABERTO" | "AGENDADO">("PAGO");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Categorias filtradas por tipo selecionado
  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  // Máscara de valor: transforma "1234,56" em "R$ 1.234,56"
  function formatarValor(raw: string): string {
    const numeros = raw.replace(/\D/g, "");
    if (!numeros) return "";
    const centavos = parseInt(numeros, 10);
    return (centavos / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatado = formatarValor(e.target.value);
    setValor(formatado);
  }

  function valorNumerico(): number {
    return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  }

  // Quando troca o tipo, limpa a categoria
  function handleTipoChange(novoTipo: "ENTRADA" | "SAIDA") {
    setTipo(novoTipo);
    setCategoriaId("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!categoriaId) {
      setErro("Selecione uma categoria.");
      return;
    }
    if (valorNumerico() <= 0) {
      setErro("Informe um valor válido.");
      return;
    }
    if (!data) {
      setErro("Informe a data.");
      return;
    }

    setSalvando(true);
    try {
      const res = await fetch("/api/lancamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          categoriaId,
          valor: valorNumerico(),
          data,
          descricao: descricao || undefined,
          fornecedor: fornecedor || undefined,
          conta: conta || undefined,
          observacao: observacao || undefined,
          status,
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      onSucesso?.();
      router.refresh();
      onClose();
    } catch {
      setErro("Erro ao salvar o lançamento. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[hsl(222,47%,9%)] border border-white/10 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">Novo Lançamento</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Toggle ENTRADA / SAÍDA — grande e visual */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => handleTipoChange("ENTRADA")}
              className={cn(
                "py-2.5 rounded-lg text-sm font-semibold transition-all",
                tipo === "ENTRADA"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              💚 Entrada
            </button>
            <button
              type="button"
              onClick={() => handleTipoChange("SAIDA")}
              className={cn(
                "py-2.5 rounded-lg text-sm font-semibold transition-all",
                tipo === "SAIDA"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              🔴 Saída
            </button>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Categoria <span className="text-rose-400">*</span>
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            >
              <option value="" className="bg-[hsl(222,47%,9%)] text-white/50">
                Selecione...
              </option>
              {categoriasFiltradas.map((c) => (
                <option key={c.id} value={c.id} className="bg-[hsl(222,47%,9%)] text-white">
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Valor <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30 font-medium">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={valor}
                onChange={handleValorChange}
                placeholder="0,00"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors tabular-nums"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Data <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          {/* Descrição (opcional) */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              Descrição{" "}
              <span className="text-white/25 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Mensalidades semana 1..."
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          {/* Seção expansível: Mais detalhes */}
          <div>
            <button
              type="button"
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors w-full text-left"
            >
              {mostrarDetalhes ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {mostrarDetalhes ? "Ocultar detalhes" : "Mais detalhes (conta, status...)"}
            </button>

            {mostrarDetalhes && (
              <div className="mt-3 space-y-3 pl-4 border-l border-white/5">
                {/* Conta bancária */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Conta
                  </label>
                  <select
                    value={conta}
                    onChange={(e) => setConta(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    <option value="" className="bg-[hsl(222,47%,9%)]">Não especificar</option>
                    {CONTAS.map((c) => (
                      <option key={c} value={c} className="bg-[hsl(222,47%,9%)] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Status
                  </label>
                  <div className="flex gap-2">
                    {(["PAGO", "EM_ABERTO", "AGENDADO"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-medium transition-all border",
                          status === s
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-white/5 bg-white/5 text-white/30 hover:text-white/60"
                        )}
                      >
                        {s === "PAGO" ? "Pago" : s === "EM_ABERTO" ? "Em Aberto" : "Agendado"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fornecedor/Cliente */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Fornecedor / Cliente
                  </label>
                  <input
                    type="text"
                    value={fornecedor}
                    onChange={(e) => setFornecedor(e.target.value)}
                    placeholder="Ex: Meta Ads, Jair (aluguel)..."
                    className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Observação
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={2}
                    placeholder="Qualquer nota adicional..."
                    className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                tipo === "ENTRADA"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20",
                salvando && "opacity-60 cursor-not-allowed"
              )}
            >
              {salvando ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {salvando ? "Salvando..." : "Salvar Lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
