import { TipoLancamento, StatusPagamento } from "@prisma/client";

export { TipoLancamento, StatusPagamento };

export const TIPO_LABELS: Record<TipoLancamento, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
};

export const STATUS_LABELS: Record<StatusPagamento, string> = {
  PAGO: "Pago",
  EM_ABERTO: "Em Aberto",
  AGENDADO: "Agendado",
};

export const CONTAS_BANCARIAS = [
  "Stone",
  "Bradesco PJ",
  "Nextfit",
  "Gympass",
  "Totalpass",
  "Caixa Físico",
  "Pix Direto",
];
