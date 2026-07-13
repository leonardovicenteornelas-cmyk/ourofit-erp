/**
 * Seed — OuroFit ERP
 * Popula o banco com:
 * 1. Categorias reais da planilha (15 receitas + 19 despesas)
 * 2. Lançamentos históricos Abr–Set 2025 (extraídos da planilha)
 */

import { prisma } from "../src/lib/prisma";
import { TipoLancamento, StatusPagamento } from "@prisma/client";

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ─── LIMPAR BANCO ─────────────────────────────────────────────
  await prisma.lancamento.deleteMany();
  await prisma.categoria.deleteMany();
  console.log("🧹 Banco limpo.");

  // ─── CATEGORIAS ───────────────────────────────────────────────
  const categoriasEntrada = await prisma.categoria.createMany({
    data: [
      { nome: "Mensalidades",          tipo: "ENTRADA", icone: "users",       ordem: 1  },
      { nome: "Diárias",               tipo: "ENTRADA", icone: "calendar",    ordem: 2  },
      { nome: "Avaliações Físicas",    tipo: "ENTRADA", icone: "clipboard",   ordem: 3  },
      { nome: "Venda de Produtos",     tipo: "ENTRADA", icone: "shopping-bag",ordem: 4  },
      { nome: "Nextfit (Repasse)",     tipo: "ENTRADA", icone: "smartphone",  ordem: 5  },
      { nome: "Stone (Recebimentos)",  tipo: "ENTRADA", icone: "credit-card", ordem: 6  },
      { nome: "Gympass (Repasse)",     tipo: "ENTRADA", icone: "zap",         ordem: 7  },
      { nome: "Totalpass (Repasse)",   tipo: "ENTRADA", icone: "zap",         ordem: 8  },
      { nome: "Outras Receitas",       tipo: "ENTRADA", icone: "plus-circle", ordem: 9  },
    ],
  });

  const categoriasSaida = await prisma.categoria.createMany({
    data: [
      { nome: "Salários e Encargos",      tipo: "SAIDA", icone: "briefcase",   ordem: 1  },
      { nome: "Aluguel",                  tipo: "SAIDA", icone: "home",        ordem: 2  },
      { nome: "Energia Elétrica",         tipo: "SAIDA", icone: "zap",         ordem: 3  },
      { nome: "Internet e Telefone",      tipo: "SAIDA", icone: "wifi",        ordem: 4  },
      { nome: "Manutenção de Equipamentos", tipo: "SAIDA", icone: "tool",      ordem: 5  },
      { nome: "Contabilidade",            tipo: "SAIDA", icone: "file-text",   ordem: 6  },
      { nome: "Impostos e Tributos",      tipo: "SAIDA", icone: "percent",     ordem: 7  },
      { nome: "Marketing e Publicidade",  tipo: "SAIDA", icone: "trending-up", ordem: 8  },
      { nome: "Sistemas e Software",      tipo: "SAIDA", icone: "monitor",     ordem: 9  },
      { nome: "Tarifa de Cartão (Stone)", tipo: "SAIDA", icone: "credit-card", ordem: 10 },
      { nome: "Fisioterapeuta / Avaliador", tipo: "SAIDA", icone: "heart",     ordem: 11 },
      { nome: "Estoque (CMV)",            tipo: "SAIDA", icone: "package",     ordem: 12 },
      { nome: "Estorno de Mensalidade",   tipo: "SAIDA", icone: "rotate-ccw",  ordem: 13 },
      { nome: "Retirada dos Sócios",      tipo: "SAIDA", icone: "arrow-right", ordem: 14 },
      { nome: "Outros Custos",            tipo: "SAIDA", icone: "more-horizontal", ordem: 15 },
    ],
  });

  console.log(`✅ ${categoriasEntrada.count + categoriasSaida.count} categorias criadas.`);

  // ─── BUSCAR IDs DAS CATEGORIAS ────────────────────────────────
  const categorias = await prisma.categoria.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categorias) {
    catMap[c.nome] = c.id;
  }

  // ─── HELPER ───────────────────────────────────────────────────
  function d(dateStr: string): Date {
    return new Date(dateStr + "T12:00:00-03:00");
  }

  // ─── LANÇAMENTOS HISTÓRICOS ───────────────────────────────────
  // Dados reais extraídos da planilha Fluxo de Caixa Setembro.xlsm
  // Abr–Set 2025

  const lancamentos = [
    // ───── ABRIL 2025 ─────────────────────────────────────────
    // Receitas Abril
    { data: d("2025-04-30"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 45210.50, descricao: "Mensalidades Abril — lote 1",     conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-04-28"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 38420.30, descricao: "Mensalidades Abril — lote 2",     conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-04-25"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 32578.23, descricao: "Mensalidades Abril — lote 3",     conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-04-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 4800.00,  descricao: "Gympass — repasse Abril",         conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-04-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 1200.00,  descricao: "Totalpass — repasse Abril",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 1350.00,  descricao: "Diárias Abril",                   conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-04-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Avaliações Físicas"],  valor: 1000.70,  descricao: "Avaliações físicas Abril",        conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-04-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 1650.04,  descricao: "Produtos Abril",                  conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-04-05"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Nextfit (Repasse)"],   valor: 1000.00,  descricao: "Nextfit — repasse Abril",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },

    // Despesas Abril
    { data: d("2025-04-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Abril",        conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Retirada dos Sócios"],    valor: 10000.00, descricao: "Retirada sócios Abril",           conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Abril — Jair",            conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Impostos e Tributos"],    valor: 2247.19,  descricao: "Impostos Abril",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Energia Elétrica"],       valor: 1619.05,  descricao: "Cemig Abril",                     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Marketing e Publicidade"],valor: 1800.00,  descricao: "Meta Ads Abril",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Abril",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estoque (CMV)"],          valor: 435.45,   descricao: "Custo de produtos Abril",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Abril",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-04-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estorno de Mensalidade"], valor: 673.90,   descricao: "Estornos Abril",                  conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-04-30"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Manutenção de Equipamentos"], valor: 189.80, descricao: "Manutenção equipamentos Abril", conta: "Caixa Físico", status: "PAGO" as StatusPagamento },

    // ───── MAIO 2025 ──────────────────────────────────────────
    // Receitas Maio
    { data: d("2025-05-30"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 44210.00, descricao: "Mensalidades Maio — lote 1",     conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-05-28"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 37900.00, descricao: "Mensalidades Maio — lote 2",     conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-05-25"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 30858.89, descricao: "Mensalidades Maio — lote 3",     conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-05-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 4200.00,  descricao: "Gympass — repasse Maio",         conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-05-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 900.00,   descricao: "Totalpass — repasse Maio",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 1000.00,  descricao: "Diárias Maio",                   conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-05-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Avaliações Físicas"],  valor: 260.00,   descricao: "Avaliações físicas Maio",        conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-05-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 1470.95,  descricao: "Produtos Maio",                  conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-05-05"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Nextfit (Repasse)"],   valor: 900.00,   descricao: "Nextfit — repasse Maio",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },

    // Despesas Maio
    { data: d("2025-05-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Maio",        conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Maio — Jair",            conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Impostos e Tributos"],    valor: 1850.00,  descricao: "Impostos Maio",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Energia Elétrica"],       valor: 1480.00,  descricao: "Cemig Maio",                     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Marketing e Publicidade"],valor: 1500.00,  descricao: "Meta Ads Maio",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Maio",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estoque (CMV)"],          valor: 399.18,   descricao: "Custo de produtos Maio",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Maio",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estorno de Mensalidade"], valor: 324.90,   descricao: "Estornos Maio",                  conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-05-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Internet e Telefone"],    valor: 315.72,   descricao: "Internet Maio",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-05-30"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Manutenção de Equipamentos"], valor: 399.00, descricao: "Manutenção equipamentos Maio", conta: "Caixa Físico", status: "PAGO" as StatusPagamento },

    // ───── JUNHO 2025 ─────────────────────────────────────────
    // Receitas Junho
    { data: d("2025-06-30"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 41500.00, descricao: "Mensalidades Junho — lote 1",    conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-06-28"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 35100.00, descricao: "Mensalidades Junho — lote 2",    conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-06-25"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 22487.30, descricao: "Mensalidades Junho — lote 3",    conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-06-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 3200.00,  descricao: "Gympass — repasse Junho",        conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-06-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 800.00,   descricao: "Totalpass — repasse Junho",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-06-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 980.00,   descricao: "Diárias Junho",                  conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-06-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Avaliações Físicas"],  valor: 545.10,   descricao: "Avaliações físicas Junho",       conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-06-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 1579.90,  descricao: "Produtos Junho",                 conta: "Caixa Físico",status: "PAGO" as StatusPagamento },

    // Despesas Junho (nota: planilha não tem despesas em Junho — dados parciais)
    { data: d("2025-06-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Junho",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-06-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Junho — Jair",           conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-06-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Junho",        conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-06-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Junho",     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },

    // ───── JULHO 2025 ─────────────────────────────────────────
    // Receitas Julho
    { data: d("2025-07-31"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 42500.00, descricao: "Mensalidades Julho — lote 1",    conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-07-28"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 36100.00, descricao: "Mensalidades Julho — lote 2",    conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-07-25"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 21843.94, descricao: "Mensalidades Julho — lote 3",    conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-07-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 4000.00,  descricao: "Gympass — repasse Julho",        conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-07-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 1000.00,  descricao: "Totalpass — repasse Julho",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 1350.00,  descricao: "Diárias Julho",                  conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-07-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Avaliações Físicas"],  valor: 826.00,   descricao: "Avaliações físicas Julho",       conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-07-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 972.62,   descricao: "Produtos Julho",                 conta: "Caixa Físico",status: "PAGO" as StatusPagamento },

    // Despesas Julho
    { data: d("2025-07-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Julho",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Retirada dos Sócios"],    valor: 8000.00,  descricao: "Retirada sócios Julho",          conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Julho — Jair",           conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Impostos e Tributos"],    valor: 2100.00,  descricao: "Impostos Julho",                 conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Energia Elétrica"],       valor: 1580.00,  descricao: "Cemig Julho",                    conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Marketing e Publicidade"],valor: 1600.00,  descricao: "Meta Ads Julho",                 conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Julho",        conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estoque (CMV)"],          valor: 1104.88,  descricao: "Custo de produtos Julho",        conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Julho",     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Internet e Telefone"],    valor: 315.72,   descricao: "Internet Julho",                 conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-07-30"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Manutenção de Equipamentos"], valor: 595.44, descricao: "Manutenção equipamentos Julho", conta: "Caixa Físico", status: "PAGO" as StatusPagamento },

    // ───── AGOSTO 2025 ────────────────────────────────────────
    // Receitas Agosto
    { data: d("2025-08-31"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 40250.00, descricao: "Mensalidades Agosto — lote 1",   conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-08-28"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 35400.00, descricao: "Mensalidades Agosto — lote 2",   conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-08-25"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 20437.65, descricao: "Mensalidades Agosto — lote 3",   conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-08-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 4200.00,  descricao: "Gympass — repasse Agosto",       conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-08-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 900.00,   descricao: "Totalpass — repasse Agosto",     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 805.00,   descricao: "Diárias Agosto",                 conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-08-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Avaliações Físicas"],  valor: 300.00,   descricao: "Avaliações físicas Agosto",      conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-08-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 2685.59,  descricao: "Produtos Agosto",                conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-08-05"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Nextfit (Repasse)"],   valor: 900.00,   descricao: "Nextfit — repasse Agosto",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },

    // Despesas Agosto
    { data: d("2025-08-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Agosto",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Agosto — Jair",          conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Impostos e Tributos"],    valor: 1980.00,  descricao: "Impostos Agosto",                conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Energia Elétrica"],       valor: 1420.00,  descricao: "Cemig Agosto",                   conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Marketing e Publicidade"],valor: 1550.00,  descricao: "Meta Ads Agosto",                conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Agosto",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estoque (CMV)"],          valor: 1604.86,  descricao: "Custo de produtos Agosto",       conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Agosto",    conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Internet e Telefone"],    valor: 315.72,   descricao: "Internet Agosto",                conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-08-30"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Manutenção de Equipamentos"], valor: 456.57, descricao: "Manutenção equipamentos Agosto", conta: "Caixa Físico", status: "PAGO" as StatusPagamento },

    // ───── SETEMBRO 2025 ──────────────────────────────────────
    // Receitas Setembro (valores reais da planilha)
    { data: d("2025-09-30"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 25556.51, descricao: "Mensalidades Set — Nextfit",      conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-09-27"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 8437.45,  descricao: "Mensalidades Set — Stone lote 1", conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-09-24"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 3324.13,  descricao: "Mensalidades Set — Stone lote 2", conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-09-22"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 28700.00, descricao: "Mensalidades Set — demais",       conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-09-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Gympass (Repasse)"],   valor: 4200.00,  descricao: "Gympass — repasse Setembro",      conta: "Gympass",     status: "PAGO" as StatusPagamento },
    { data: d("2025-09-20"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Totalpass (Repasse)"], valor: 800.00,   descricao: "Totalpass — repasse Setembro",    conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-18"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 22256.70, descricao: "Mensalidades Set — complemento",  conta: "Nextfit",     status: "PAGO" as StatusPagamento },
    { data: d("2025-09-15"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Diárias"],             valor: 636.81,   descricao: "Diárias Setembro",                conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-09-10"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Venda de Produtos"],   valor: 966.00,   descricao: "Produtos Setembro",               conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-09-05"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Nextfit (Repasse)"],   valor: 4000.00,  descricao: "Nextfit — repasse Setembro",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },

    // Despesas Setembro (valores reais da planilha)
    { data: d("2025-09-29"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Salários e Encargos"],    valor: 15773.13, descricao: "Folha de pagamento Setembro",     conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-28"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Energia Elétrica"],       valor: 1619.05,  descricao: "Cemig Setembro",                  conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-26"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Impostos e Tributos"],    valor: 2247.19,  descricao: "Impostos Setembro",               conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-25"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Marketing e Publicidade"],valor: 1800.00,  descricao: "Meta Ads Setembro",               conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-23"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Sistemas e Software"],    valor: 597.00,   descricao: "Nextfit — sistema Setembro",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-22"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Aluguel"],                valor: 3127.78,  descricao: "Aluguel Setembro — Jair",         conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-20"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Estoque (CMV)"],          valor: 1139.00,  descricao: "Custo de produtos Setembro",      conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-18"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Contabilidade"],          valor: 800.00,   descricao: "Honorários contábeis Setembro",   conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Fisioterapeuta / Avaliador"], valor: 1200.00, descricao: "Fisioterapeuta Setembro",      conta: "Caixa Físico",status: "PAGO" as StatusPagamento },
    { data: d("2025-09-15"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Internet e Telefone"],    valor: 315.72,   descricao: "Internet Setembro",               conta: "Bradesco PJ", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-10"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Manutenção de Equipamentos"], valor: 884.73, descricao: "Manutenção equipamentos Set",   conta: "Caixa Físico", status: "PAGO" as StatusPagamento },
    { data: d("2025-09-05"), tipo: "SAIDA" as TipoLancamento, categoriaId: catMap["Tarifa de Cartão (Stone)"], valor: 2000.00, descricao: "Tarifa Stone Setembro",          conta: "Stone",       status: "PAGO" as StatusPagamento },

    // ───── OUTUBRO 2025 (parcial — primeiros dias) ────────────
    { data: d("2025-10-05"), tipo: "SAIDA" as TipoLancamento,  categoriaId: catMap["Salários e Encargos"],  valor: 15773.13, descricao: "Folha de pagamento Outubro",      conta: "Bradesco PJ", status: "EM_ABERTO" as StatusPagamento },
    { data: d("2025-10-05"), tipo: "ENTRADA" as TipoLancamento, categoriaId: catMap["Mensalidades"],        valor: 8200.00,  descricao: "Mensalidades Out — antecipadas",  conta: "Stone",       status: "PAGO" as StatusPagamento },
    { data: d("2025-10-01"), tipo: "SAIDA" as TipoLancamento,  categoriaId: catMap["Aluguel"],              valor: 3127.78,  descricao: "Aluguel Outubro — Jair",          conta: "Bradesco PJ", status: "EM_ABERTO" as StatusPagamento },
  ];

  // Criar lançamentos em lote
  let total = 0;
  for (const l of lancamentos) {
    await prisma.lancamento.create({ data: l });
    total++;
  }

  console.log(`✅ ${total} lançamentos históricos criados (Abr–Out 2025).`);
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
