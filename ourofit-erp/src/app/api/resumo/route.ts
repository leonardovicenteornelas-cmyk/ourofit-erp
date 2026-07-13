// GET /api/resumo — KPIs do Dashboard + dados para gráfico + DRE + Fluxo de Caixa
// Endpoint unificado: substitui 3 endpoints separados

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Mês de referência (padrão: mês atual)
    const mesRef = searchParams.get("mes"); // formato "2025-09"

    const agora = new Date();
    const anoRef = mesRef ? parseInt(mesRef.split("-")[0]) : agora.getFullYear();
    const numMes = mesRef ? parseInt(mesRef.split("-")[1]) : agora.getMonth() + 1;

    const inicioMes      = new Date(anoRef, numMes - 1, 1);
    const fimMes         = new Date(anoRef, numMes, 0, 23, 59, 59);
    const inicioMesAnt   = new Date(anoRef, numMes - 2, 1);
    const fimMesAnt      = new Date(anoRef, numMes - 1, 0, 23, 59, 59);

    // ─── KPIs do mês atual ────────────────────────────────────────
    const [entradasMes, saidasMes, entradasMesAnt, saidasMesAnt, ultimosLancamentos] =
      await Promise.all([
        // Receita do mês
        prisma.lancamento.aggregate({
          where: { tipo: "ENTRADA", status: "PAGO", data: { gte: inicioMes, lte: fimMes } },
          _sum: { valor: true },
        }),
        // Despesas do mês
        prisma.lancamento.aggregate({
          where: { tipo: "SAIDA", status: "PAGO", data: { gte: inicioMes, lte: fimMes } },
          _sum: { valor: true },
        }),
        // Receita mês anterior
        prisma.lancamento.aggregate({
          where: { tipo: "ENTRADA", status: "PAGO", data: { gte: inicioMesAnt, lte: fimMesAnt } },
          _sum: { valor: true },
        }),
        // Despesas mês anterior
        prisma.lancamento.aggregate({
          where: { tipo: "SAIDA", status: "PAGO", data: { gte: inicioMesAnt, lte: fimMesAnt } },
          _sum: { valor: true },
        }),
        // Últimos 5 lançamentos
        prisma.lancamento.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { categoria: { select: { nome: true } } },
        }),
      ]);

    const receitaMes     = Number(entradasMes._sum.valor ?? 0);
    const despesasMes    = Number(saidasMes._sum.valor ?? 0);
    const receitaMesAnt  = Number(entradasMesAnt._sum.valor ?? 0);
    const despesasMesAnt = Number(saidasMesAnt._sum.valor ?? 0);

    // ─── Saldo total em caixa (todos os pagos) ────────────────────
    const [totalEntradas, totalSaidas] = await Promise.all([
      prisma.lancamento.aggregate({
        where: { tipo: "ENTRADA", status: "PAGO" },
        _sum: { valor: true },
      }),
      prisma.lancamento.aggregate({
        where: { tipo: "SAIDA", status: "PAGO" },
        _sum: { valor: true },
      }),
    ]);
    const saldoAtual = Number(totalEntradas._sum.valor ?? 0) - Number(totalSaidas._sum.valor ?? 0);

    // ─── Dados para gráfico (últimos 6 meses) ─────────────────────
    const grafico = [];
    for (let i = 5; i >= 0; i--) {
      const anoG   = numMes - i <= 0 ? anoRef - 1 : anoRef;
      const mesG   = ((numMes - i - 1 + 12) % 12) + 1;
      const inicioG = new Date(anoG, mesG - 1, 1);
      const fimG    = new Date(anoG, mesG, 0, 23, 59, 59);

      const [ent, sai] = await Promise.all([
        prisma.lancamento.aggregate({
          where: { tipo: "ENTRADA", status: "PAGO", data: { gte: inicioG, lte: fimG } },
          _sum: { valor: true },
        }),
        prisma.lancamento.aggregate({
          where: { tipo: "SAIDA", status: "PAGO", data: { gte: inicioG, lte: fimG } },
          _sum: { valor: true },
        }),
      ]);

      const receita  = Number(ent._sum.valor ?? 0);
      const despesa  = Number(sai._sum.valor ?? 0);

      grafico.push({
        mes: mesG,
        ano: anoG,
        label: `${["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][mesG - 1]}/${String(anoG).slice(2)}`,
        receita,
        despesa,
        resultado: receita - despesa,
      });
    }

    // ─── DRE Resumida (mês atual por categoria) ───────────────────
    const lancamentosMes = await prisma.lancamento.findMany({
      where: { status: "PAGO", data: { gte: inicioMes, lte: fimMes } },
      include: { categoria: { select: { nome: true, tipo: true } } },
    });

    type CatMap = { [nome: string]: number };
    const dreEntradas: CatMap = {};
    const dreSaidas:   CatMap = {};

    for (const l of lancamentosMes) {
      const nome = l.categoria.nome;
      const val  = Number(l.valor);
      if (l.tipo === "ENTRADA") {
        dreEntradas[nome] = (dreEntradas[nome] ?? 0) + val;
      } else {
        dreSaidas[nome] = (dreSaidas[nome] ?? 0) + val;
      }
    }

    return NextResponse.json({
      kpis: {
        receitaMes,
        despesasMes,
        resultadoMes:    receitaMes - despesasMes,
        saldoAtual,
        receitaMesAnt,
        despesasMesAnt,
        resultadoMesAnt: receitaMesAnt - despesasMesAnt,
      },
      grafico,
      ultimosLancamentos: ultimosLancamentos.map((l) => ({
        id:        l.id,
        tipo:      l.tipo,
        valor:     Number(l.valor),
        data:      l.data,
        descricao: l.descricao ?? l.categoria.nome,
        status:    l.status,
        categoria: l.categoria.nome,
      })),
      dre: {
        entradas: dreEntradas,
        saidas:   dreSaidas,
        totalEntradas: receitaMes,
        totalSaidas:   despesasMes,
      },
    });
  } catch (error) {
    console.error("Erro ao calcular resumo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
