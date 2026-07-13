import { prisma } from "../src/lib/prisma";
import { TipoLancamento, StatusPagamento } from "@prisma/client";

async function main() {
  console.log("🌱 Iniciando geração de dados mockados realistas para o Sandbox...");

  // ─── LIMPAR BANCO ─────────────────────────────────────────────
  await prisma.lancamento.deleteMany();
  await prisma.categoria.deleteMany();
  console.log("🧹 Banco limpo.");

  // ─── CRIAR CATEGORIAS PADRÃO ──────────────────────────────────
  const categoriasEntrada = [
    { nome: "Mensalidades",          tipo: "ENTRADA" as TipoLancamento, icone: "users",       ordem: 1  },
    { nome: "Diárias",               tipo: "ENTRADA" as TipoLancamento, icone: "calendar",    ordem: 2  },
    { nome: "Avaliações Físicas",    tipo: "ENTRADA" as TipoLancamento, icone: "clipboard",   ordem: 3  },
    { nome: "Venda de Produtos",     tipo: "ENTRADA" as TipoLancamento, icone: "shopping-bag",ordem: 4  },
    { nome: "Nextfit (Repasse)",     tipo: "ENTRADA" as TipoLancamento, icone: "smartphone",  ordem: 5  },
    { nome: "Stone (Recebimentos)",  tipo: "ENTRADA" as TipoLancamento, icone: "credit-card", ordem: 6  },
    { nome: "Gympass (Repasse)",     tipo: "ENTRADA" as TipoLancamento, icone: "zap",         ordem: 7  },
    { nome: "Totalpass (Repasse)",   tipo: "ENTRADA" as TipoLancamento, icone: "zap",         ordem: 8  },
    { nome: "Outras Receitas",       tipo: "ENTRADA" as TipoLancamento, icone: "plus-circle", ordem: 9  },
  ];

  const categoriasSaida = [
    { nome: "Salários e Encargos",      tipo: "SAIDA" as TipoLancamento, icone: "briefcase",   ordem: 1  },
    { nome: "Aluguel",                  tipo: "SAIDA" as TipoLancamento, icone: "home",        ordem: 2  },
    { nome: "Energia Elétrica",         tipo: "SAIDA" as TipoLancamento, icone: "zap",         ordem: 3  },
    { nome: "Internet e Telefone",      tipo: "SAIDA" as TipoLancamento, icone: "wifi",        ordem: 4  },
    { nome: "Manutenção de Equipamentos", tipo: "SAIDA" as TipoLancamento, icone: "tool",      ordem: 5  },
    { nome: "Contabilidade",            tipo: "SAIDA" as TipoLancamento, icone: "file-text",   ordem: 6  },
    { nome: "Impostos e Tributos",      tipo: "SAIDA" as TipoLancamento, icone: "percent",     ordem: 7  },
    { nome: "Marketing e Publicidade",  tipo: "SAIDA" as TipoLancamento, icone: "trending-up", ordem: 8  },
    { nome: "Sistemas e Software",      tipo: "SAIDA" as TipoLancamento, icone: "monitor",     ordem: 9  },
    { nome: "Tarifa de Cartão (Stone)", tipo: "SAIDA" as TipoLancamento, icone: "credit-card", ordem: 10 },
    { nome: "Fisioterapeuta / Avaliador", tipo: "SAIDA" as TipoLancamento, icone: "heart",     ordem: 11 },
    { nome: "Estoque (CMV)",            tipo: "SAIDA" as TipoLancamento, icone: "package",     ordem: 12 },
    { nome: "Estorno de Mensalidade",   tipo: "SAIDA" as TipoLancamento, icone: "rotate-ccw",  ordem: 13 },
    { nome: "Retirada dos Sócios",      tipo: "SAIDA" as TipoLancamento, icone: "arrow-right", ordem: 14 },
    { nome: "Outros Custos",            tipo: "SAIDA" as TipoLancamento, icone: "more-horizontal", ordem: 15 },
  ];

  await prisma.categoria.createMany({ data: [...categoriasEntrada, ...categoriasSaida] });
  console.log("✅ Categorias padronizadas criadas.");

  const categorias = await prisma.categoria.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categorias) {
    catMap[c.nome] = c.id;
  }

  // ─── GERAR DADOS PARA CADA MÊS (JANEIRO A JULHO 2026) ───────────
  // Para tornar os dados consistentes e ligeiramente variados
  const meses = [
    { ano: 2026, mes: 1, nome: "Janeiro" },
    { ano: 2026, mes: 2, nome: "Fevereiro" },
    { ano: 2026, mes: 3, nome: "Março" },
    { ano: 2026, mes: 4, nome: "Abril" },
    { ano: 2026, mes: 5, nome: "Maio" },
    { ano: 2026, mes: 6, nome: "Junho" },
    { ano: 2026, mes: 7, nome: "Julho" }
  ];

  let totalLancamentos = 0;

  for (const m of meses) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = (dia: number) => new Date(`${m.ano}-${pad(m.mes)}-${pad(dia)}T12:00:00-03:00`);
    
    // Fator de variação sazonal nos valores
    const varFactor = 1 + (Math.sin(m.mes) * 0.08); // variação de +-8%

    const lancamentos = [
      // 🟢 RECEITAS
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Mensalidades"],
        descricao: `Mensalidades Nextfit — Recorrência ${m.nome}`,
        valor: Math.round(24500 * varFactor * 100) / 100,
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Nextfit Pay"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Stone (Recebimentos)"],
        descricao: `Recebimentos Stone — Maquininha ${m.nome}`,
        valor: Math.round(21200 * (2 - varFactor) * 100) / 100,
        data: d(12),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Gympass (Repasse)"],
        descricao: `Repasse Mensal Gympass ${m.nome}`,
        valor: Math.round(4800 * varFactor * 100) / 100,
        data: d(20),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Totalpass (Repasse)"],
        descricao: `Repasse Mensal Totalpass ${m.nome}`,
        valor: Math.round(1800 * varFactor * 100) / 100,
        data: d(22),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Diárias"],
        descricao: `Diárias avulsas acumuladas — ${m.nome}`,
        valor: Math.round(1150 * varFactor * 100) / 100,
        data: d(15),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Avaliações Físicas"],
        descricao: `Avaliações físicas do mês — ${m.nome}`,
        valor: Math.round(950 * varFactor * 100) / 100,
        data: d(18),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Venda de Produtos"],
        descricao: `Venda de suplementos e acessórios — ${m.nome}`,
        valor: Math.round(1650 * varFactor * 100) / 100,
        data: d(25),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },

      // 🔴 DESPESAS
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Salários e Encargos"],
        descricao: `Folha de Pagamento Professores e Recepção — ${m.nome}`,
        valor: Math.round(13500 * 100) / 100,
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Colaboradores Ourofit"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Aluguel"],
        descricao: `Aluguel mensal do imóvel — Ref ${m.nome}`,
        valor: 3222.65,
        data: d(10),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Jair (Locador)"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Energia Elétrica"],
        descricao: `Conta de Luz Cemig — Competência ${m.nome}`,
        valor: Math.round(1450 * varFactor * 100) / 100,
        data: d(12),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Cemig Distribuidora"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Internet e Telefone"],
        descricao: `Mensalidade Link de Internet Dedicada + Telefone`,
        valor: 315.72,
        data: d(15),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Claro Telecom"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Contabilidade"],
        descricao: `Honorários contábeis assessoria mensal`,
        valor: 350.00,
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Exata Contabilidade"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Impostos e Tributos"],
        descricao: `Guia de DAS / Simples Nacional — ${m.nome}`,
        valor: Math.round(2100 * varFactor * 100) / 100,
        data: d(20),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Receita Federal"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Marketing e Publicidade"],
        descricao: `Campanhas Meta Ads (Facebook/Instagram) — ${m.nome}`,
        valor: 1200.00,
        data: d(8),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Meta Platforms"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Sistemas e Software"],
        descricao: `Mensalidade Nextfit — Software de Gestão e Catraca`,
        valor: 379.00,
        data: d(10),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Nextfit Software"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Tarifa de Cartão (Stone)"],
        descricao: `Taxas de intermediação de crédito/débito Stone`,
        valor: Math.round(920 * varFactor * 100) / 100,
        data: d(30),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ",
        fornecedor: "Stone Pagamentos"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Fisioterapeuta / Avaliador"],
        descricao: `Repasse Avaliações Físicas prestador serviço`,
        valor: Math.round(350 * varFactor * 100) / 100,
        data: d(28),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Dr. Rodrigo (Fisioterapeuta)"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Estoque (CMV)"],
        descricao: `Reposição de estoque de águas e isotônicos`,
        valor: Math.round(620 * varFactor * 100) / 100,
        data: d(17),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Distribuidora Bebidas"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Manutenção de Equipamentos"],
        descricao: `Troca de cabos e estofados aparelhos musculação`,
        valor: Math.round(750 * (2 - varFactor) * 100) / 100,
        data: d(22),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Jonathan Equipamentos"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Estorno de Mensalidade"],
        descricao: `Estorno cancelamento matrícula proporcional`,
        valor: 180.00,
        data: d(27),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Outros Custos"],
        descricao: `Material de limpeza e escritório recepção`,
        valor: Math.round(480 * varFactor * 100) / 100,
        data: d(14),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },
      
      // 💸 RETIRADA DOS SÓCIOS (Retirada estruturada que deixa lucro no caixa)
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Retirada dos Sócios"],
        descricao: `Distribuição de Lucros Mensal Sócios — ${m.nome}`,
        valor: Math.round(15000 * 100) / 100,
        data: d(28),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Sócios Ourofit"
      }
    ];

    await prisma.lancamento.createMany({
      data: lancamentos.map(l => ({
        tipo: l.tipo,
        categoriaId: l.categoriaId,
        descricao: l.descricao,
        valor: l.valor,
        data: l.data,
        status: l.status,
        conta: l.conta,
        fornecedor: l.fornecedor || null
      }))
    });
    totalLancamentos += lancamentos.length;
  }

  console.log(`✅ Sucesso! Gerados ${totalLancamentos} lançamentos mockados limpos (Jan-Jul 2026).`);
  console.log("🎉 Seed Sandbox concluído com sucesso!");
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
