import { prisma } from "../src/lib/prisma";
import { TipoLancamento, StatusPagamento } from "@prisma/client";

async function main() {
  console.log("🌱 Iniciando geração de simulação ultra-realista para o Sandbox...");

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
  console.log("✅ Categorias padrão criadas.");

  const categorias = await prisma.categoria.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categorias) {
    catMap[c.nome] = c.id;
  }

  // Helper para gerar número aleatório com base e percentual de variância
  function rand(base: number, variancePercent: number): number {
    const factor = 1 + (Math.random() * 2 - 1) * (variancePercent / 100);
    return Math.round(base * factor * 100) / 100;
  }

  // ─── CRONOGRAMA DE EVENTOS E SAZONALIDADES MENSAIS (2026) ───────────
  const meses = [
    {
      numero: 1,
      nome: "Janeiro",
      receitasMult: 1.15, // Boom de ano novo
      despesasMult: 1.0,
      evento: "Janeiro Fitness: Promoção especial de matrícula anual causou pico no faturamento.",
      customManutencao: 450,
      customRetirada: 18000, // Retirada de sócios maior devido ao excelente caixa
    },
    {
      numero: 2,
      nome: "Fevereiro",
      receitasMult: 1.05, // Estável com carnaval
      despesasMult: 0.95,
      evento: "Fevereiro de Carnaval: Menor venda de suplementos, mas repasses de cartões mantiveram-se altos.",
      customManutencao: 320,
      customRetirada: 14000,
    },
    {
      numero: 3,
      nome: "Março",
      receitasMult: 1.0,
      despesasMult: 1.12, // Despesa extra de manutenção
      evento: "Março de Manutenção: Troca completa dos cabos de aço e lona de 3 esteiras ergométricas.",
      customManutencao: 4200, // Manutenção pesada
      customRetirada: 10000, // Redução na retirada para cobrir a manutenção
    },
    {
      numero: 4,
      nome: "Abril",
      receitasMult: 0.98,
      despesasMult: 1.0,
      evento: "Abril de Rotina: Fluxo de caixa muito equilibrado e sem surpresas operacionais.",
      customManutencao: 650,
      customRetirada: 12000,
    },
    {
      numero: 5,
      nome: "Maio",
      receitasMult: 0.92, // Inverno chegando, faturamento cai ligeiramente
      despesasMult: 1.05, // Conta de luz maior devido ao frio/chuveiros
      evento: "Maio Frio: Queda sazonal nas diárias e aumento de 20% no consumo de energia elétrica.",
      customManutencao: 850,
      customRetirada: 9000,
    },
    {
      numero: 6,
      nome: "Junho",
      receitasMult: 0.95,
      despesasMult: 1.15, // Bonificação ou custos extras
      evento: "Junho de Readequação: Contratação de professor de Spinning temporário para cobrir férias.",
      customManutencao: 500,
      customRetirada: 11000,
    },
    {
      numero: 7,
      nome: "Julho",
      receitasMult: 1.1, // Promoção de inverno ou férias escolares
      despesasMult: 1.08,
      evento: "Julho de Férias: Lançamento do Plano Férias gerou aumento de 20% no repasse da Stone.",
      customManutencao: 750,
      customRetirada: 15000,
    }
  ];

  let totalLancamentos = 0;

  for (const m of meses) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const d = (dia: number) => new Date(`2026-${pad(m.numero)}-${pad(dia)}T12:00:00-03:00`);

    const lancamentos = [
      // 🟢 RECEITAS (Variando dinamicamente)
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Mensalidades"],
        descricao: `Mensalidades Nextfit — ${m.nome}`,
        valor: rand(24000 * m.receitasMult, 3), // base 24k + sazonalidade + 3% variação
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Nextfit Pay"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Stone (Recebimentos)"],
        descricao: `Faturamento Cartões Stone — ${m.nome}`,
        valor: rand(20000 * m.receitasMult, 4),
        data: d(12),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Gympass (Repasse)"],
        descricao: `Repasse Gympass Corporativo — ${m.nome}`,
        valor: rand(4500 * m.receitasMult, 5),
        data: d(20),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Totalpass (Repasse)"],
        descricao: `Repasse Totalpass — ${m.nome}`,
        valor: rand(1700 * m.receitasMult, 5),
        data: d(22),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Diárias"],
        descricao: `Diárias avulsas acumuladas — ${m.nome}`,
        valor: rand(1100 * m.receitasMult, 8),
        data: d(15),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Avaliações Físicas"],
        descricao: `Avaliações físicas alunos — ${m.nome}`,
        valor: rand(900 * m.receitasMult, 10),
        data: d(18),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },
      {
        tipo: "ENTRADA" as TipoLancamento,
        categoriaId: catMap["Venda de Produtos"],
        descricao: `Venda produtos e suplementos — ${m.nome}`,
        valor: rand(1500 * m.receitasMult, 12),
        data: d(25),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },

      // 🔴 DESPESAS OPERACIONAIS
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Salários e Encargos"],
        descricao: `Folha de Pagamento Professores/Recepção — ${m.nome}`,
        valor: m.numero === 6 ? rand(15500, 1) : rand(13500, 1), // Junho com contratação extra
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Colaboradores Ourofit"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Aluguel"],
        descricao: `Aluguel imóvel academia — Ref ${m.nome}`,
        valor: 3222.65, // Fixo exato
        data: d(10),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Jair (Locador)"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Energia Elétrica"],
        descricao: `Fatura Cemig Distribuição — ${m.nome}`,
        valor: m.numero === 5 ? rand(1750, 4) : rand(1450 * m.despesasMult, 5), // Maio com pico de energia
        data: d(12),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Cemig Distribuidora"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Internet e Telefone"],
        descricao: `Link Internet Dedicada Claro Empresas`,
        valor: 315.72, // Fixo exato
        data: d(15),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Claro Telecom"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Contabilidade"],
        descricao: `Assessoria mensal honorários contabilidade`,
        valor: 350.00, // Fixo exato
        data: d(5),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Exata Contabilidade"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Impostos e Tributos"],
        descricao: `Simples Nacional (DAS) faturamento — ${m.nome}`,
        valor: rand(2100 * m.receitasMult, 5),
        data: d(20),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Receita Federal"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Marketing e Publicidade"],
        descricao: `Tráfego Pago Instagram/Facebook — ${m.nome}`,
        valor: m.numero === 7 ? 2200.00 : rand(1200, 3), // Julho com maior investimento de marketing
        data: d(8),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Meta Platforms"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Sistemas e Software"],
        descricao: `Licença Nextfit Software de Gestão`,
        valor: 379.00, // Fixo exato
        data: d(10),
        status: StatusPagamento.PAGO,
        conta: "Bradesco PJ",
        fornecedor: "Nextfit Software"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Tarifa de Cartão (Stone)"],
        descricao: `Tarifas intermediação crédito/débito — ${m.nome}`,
        valor: rand(920 * m.receitasMult, 4),
        data: d(30),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ",
        fornecedor: "Stone Pagamentos"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Fisioterapeuta / Avaliador"],
        descricao: `Comissão avaliações físicas — ${m.nome}`,
        valor: rand(350 * m.receitasMult, 8),
        data: d(28),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Dr. Rodrigo (Fisioterapeuta)"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Estoque (CMV)"],
        descricao: `Compra estoque recepção bebidas/suplementos`,
        valor: rand(620 * m.receitasMult, 10),
        data: d(17),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Distribuidora Bebidas"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Manutenção de Equipamentos"],
        descricao: `Serviços manutenção e reparo aparelhos — ${m.nome}`,
        valor: m.customManutencao, // Evento customizado por mês (Março alto)
        data: d(22),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico",
        fornecedor: "Jonathan Equipamentos"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Estorno de Mensalidade"],
        descricao: `Estorno proporcional devolução matrícula`,
        valor: rand(200, 20),
        data: d(27),
        status: StatusPagamento.PAGO,
        conta: "Stone PJ"
      },
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Outros Custos"],
        descricao: `Despesas miúdas caixa de recepção — ${m.nome}`,
        valor: rand(500, 15),
        data: d(14),
        status: StatusPagamento.PAGO,
        conta: "Caixa Físico"
      },

      // 💸 RETIRADA DOS SÓCIOS (Varia de acordo com o desempenho do caixa no mês)
      {
        tipo: "SAIDA" as TipoLancamento,
        categoriaId: catMap["Retirada dos Sócios"],
        descricao: `Distribuição de Lucros Sócios — ${m.nome}`,
        valor: m.customRetirada,
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

  console.log(`✅ Sucesso! Gerada simulação ultra-realista com ${totalLancamentos} lançamentos (Jan-Jul 2026).`);
  console.log("🎉 Seed Sandbox atualizado com sucesso!");
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
