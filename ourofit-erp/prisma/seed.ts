import { prisma } from "../src/lib/prisma";
import { TipoLancamento, StatusPagamento } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🌱 Iniciando importação dos dados reais das planilhas...");

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
  console.log("✅ Categorias criadas no banco.");

  // Buscar IDs das categorias criadas
  const categorias = await prisma.categoria.findMany();
  const catMap: Record<string, string> = {};
  for (const c of categorias) {
    catMap[c.nome] = c.id;
  }

  // ─── FUNÇÃO DE MAPEAMENTO ──────────────────────────────────────
  function mapCategory(rawCat: string, tipo: 'ENTRADA' | 'SAIDA'): string {
    const norm = rawCat.toUpperCase().trim();
    if (tipo === 'ENTRADA') {
      if (norm.includes('MENSALIDADE') || norm.includes('PLANO') || norm.includes('MATRICULA')) return "Mensalidades";
      if (norm.includes('DIARIA')) return "Diárias";
      if (norm.includes('AVALIAÇ') || norm.includes('REAVALIAÇ') || norm.includes('FICHA DE TREINO')) return "Avaliações Físicas";
      if (norm.includes('PRODUTO')) return "Venda de Produtos";
      if (norm.includes('GYMPASS')) return "Gympass (Repasse)";
      if (norm.includes('TOTALPASS')) return "Totalpass (Repasse)";
      if (norm.includes('STONE')) return "Stone (Recebimentos)";
      if (norm.includes('NEXTFIT')) return "Nextfit (Repasse)";
      return "Outras Receitas";
    } else {
      if (norm.includes('SALÁRIO') || norm.includes('SALARIOS') || norm.includes('FOLHA DE PAGAMENTO') || norm.includes('BOLO FUNCIONARIO') || norm.includes('BENEFÍCIO') || norm.includes('BENEFICIOS') || norm.includes('CESTA BASICA') || norm.includes('ACERTO')) return "Salários e Encargos";
      if (norm.includes('ALUGUEL')) return "Aluguel";
      if (norm.includes('CEMIG') || norm.includes('CONSUMO')) return "Energia Elétrica";
      if (norm.includes('INTERNET') || norm.includes('TELEFONE')) return "Internet e Telefone";
      if (norm.includes('MANUTENÇ') || norm.includes('MÁQUINAS') || norm.includes('MAQUINAS') || norm.includes('EQUIPAMENTO')) return "Manutenção de Equipamentos";
      if (norm.includes('CONTABILIDADE')) return "Contabilidade";
      if (norm.includes('TRIBUTO') || norm.includes('IMPOSTO')) return "Impostos e Tributos";
      if (norm.includes('MARKETING') || norm.includes('PROPAGANDA') || norm.includes('PUBLICIDADE')) return "Marketing e Publicidade";
      if (norm.includes('SISTEMA') || norm.includes('SOFTWARE')) return "Sistemas e Software";
      if (norm.includes('TARIFA') || norm.includes('STONE')) return "Tarifa de Cartão (Stone)";
      if (norm.includes('FISIOTERAPEUTA') || norm.includes('AVALIADOR')) return "Fisioterapeuta / Avaliador";
      if (norm.includes('ESTOQUE') || norm.includes('CMV')) return "Estoque (CMV)";
      if (norm.includes('ESTORNO')) return "Estorno de Mensalidade";
      if (norm.includes('RETIRADA')) return "Retirada dos Sócios";
      return "Outros Custos";
    }
  }

  // ─── CARREGAR DADOS DO JSON ───────────────────────────────────
  const jsonPath = "C:\\Users\\Leonardo\\Desktop\\Leo\\Desenvolvimento de softwere pessoal\\Isabela\\all_parsed_data.json";
  const rawJson = fs.readFileSync(jsonPath, "utf-8");
  const allData = JSON.parse(rawJson);

  const entries2025 = allData.entries_2025;
  const entries2026 = allData.entries_2026;

  const rawEntries = [
    ...entries2026.entradas,
    ...entries2026.saidas,
  ];

  console.log(`📦 Encontrados ${rawEntries.length} lançamentos brutos no JSON.`);

  // Preparar os lançamentos para inserção
  const records = rawEntries.map((e) => {
    const tipo = e.tipo as TipoLancamento;
    const mappedCatName = mapCategory(e.categoria, tipo);
    const categoriaId = catMap[mappedCatName];
    if (!categoriaId) {
      throw new Error(`Categoria mapeada não encontrada: ${mappedCatName}`);
    }

    let status: StatusPagamento = StatusPagamento.PAGO;
    if (e.status === "EM_ABERTO" || e.status === "EM ABERTO") {
      status = StatusPagamento.EM_ABERTO;
    } else if (e.status === "AGENDADO") {
      status = StatusPagamento.AGENDADO;
    }

    return {
      tipo,
      categoriaId,
      descricao: e.descricao || null,
      valor: e.valor,
      data: new Date(e.data + "T12:00:00-03:00"),
      status,
      conta: tipo === "ENTRADA" ? e.categoria : "Bradesco PJ",
      fornecedor: e.descricao || null
    };
  });

  // Criar lançamentos em lotes
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await prisma.lancamento.createMany({
      data: batch.map(r => ({
        tipo: r.tipo,
        categoriaId: r.categoriaId,
        descricao: r.descricao,
        valor: r.valor,
        data: r.data,
        status: r.status,
        conta: r.conta,
        fornecedor: r.fornecedor
      }))
    });
    inserted += batch.length;
    console.log(`⏳ Progresso: ${inserted}/${records.length} inseridos...`);
  }

  console.log(`✅ Sucesso! ${inserted} lançamentos inseridos.`);
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
