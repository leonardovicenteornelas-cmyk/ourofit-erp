import { z } from "zod";

// Schema simplificado para o formulário de lançamento do front-end
export const lancamentoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  categoriaId: z.string().min(1, "Selecione uma categoria"),
  valor: z.number().positive("O valor deve ser maior que zero"),
  data: z.string().min(1, "Informe a data"),
  descricao: z.string().optional(),
  fornecedor: z.string().optional(),
  conta: z.string().optional(),
  observacao: z.string().optional(),
  status: z.enum(["PAGO", "EM_ABERTO", "AGENDADO"]).default("PAGO"),
});

export type LancamentoFormData = z.infer<typeof lancamentoSchema>;

export const filtroLancamentosSchema = z.object({
  mes: z.string().optional(), // formato: "2025-09"
  tipo: z.enum(["ENTRADA", "SAIDA", "TODOS"]).default("TODOS"),
  status: z.enum(["PAGO", "EM_ABERTO", "AGENDADO", "TODOS"]).default("TODOS"),
  busca: z.string().optional(),
});

export type FiltroLancamentos = z.infer<typeof filtroLancamentosSchema>;
