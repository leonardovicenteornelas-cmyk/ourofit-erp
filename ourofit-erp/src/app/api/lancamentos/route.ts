// GET /api/lancamentos — Lista lançamentos com filtros
// POST /api/lancamentos — Cria novo lançamento

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoLancamento, StatusPagamento } from "@prisma/client";

// Schema de validação para criação
const criarLancamentoSchema = z.object({
  tipo:        z.enum(["ENTRADA", "SAIDA"]),
  categoriaId: z.string().min(1, "Categoria obrigatória"),
  valor:       z.number().positive("Valor deve ser positivo"),
  data:        z.string().min(1, "Data obrigatória"),
  descricao:   z.string().optional(),
  fornecedor:  z.string().optional(),
  conta:       z.string().optional(),
  observacao:  z.string().optional(),
  status:      z.enum(["PAGO", "EM_ABERTO", "AGENDADO"]).default("PAGO"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo    = searchParams.get("tipo") as TipoLancamento | null;
    const status  = searchParams.get("status") as StatusPagamento | null;
    const busca   = searchParams.get("busca") ?? "";
    const mes     = searchParams.get("mes"); // formato: "2025-09"
    const limit   = parseInt(searchParams.get("limit") ?? "50");
    const offset  = parseInt(searchParams.get("offset") ?? "0");

    // Construir filtro
    type WhereClause = {
      tipo?: TipoLancamento;
      status?: StatusPagamento;
      data?: { gte: Date; lte: Date };
      OR?: Array<{descricao?: { contains: string; mode: "insensitive" }; fornecedor?: { contains: string; mode: "insensitive" }}>;
    };
    const where: WhereClause = {};

    if (tipo)   where.tipo   = tipo;
    if (status) where.status = status;

    if (mes) {
      const [ano, numMes] = mes.split("-").map(Number);
      const inicio = new Date(ano, numMes - 1, 1);
      const fim    = new Date(ano, numMes, 0, 23, 59, 59);
      where.data   = { gte: inicio, lte: fim };
    }

    if (busca) {
      where.OR = [
        { descricao:  { contains: busca, mode: "insensitive" } },
        { fornecedor: { contains: busca, mode: "insensitive" } },
      ];
    }

    const [lancamentos, total] = await Promise.all([
      prisma.lancamento.findMany({
        where,
        include: { categoria: { select: { nome: true, icone: true } } },
        orderBy: { data: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.lancamento.count({ where }),
    ]);

    return NextResponse.json({ lancamentos, total });
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dados = criarLancamentoSchema.parse(body);

    const lancamento = await prisma.lancamento.create({
      data: {
        tipo:        dados.tipo as TipoLancamento,
        categoriaId: dados.categoriaId,
        valor:       dados.valor,
        data:        new Date(dados.data),
        descricao:   dados.descricao ?? null,
        fornecedor:  dados.fornecedor ?? null,
        conta:       dados.conta ?? null,
        observacao:  dados.observacao ?? null,
        status:      dados.status as StatusPagamento,
      },
      include: { categoria: { select: { nome: true, icone: true } } },
    });

    return NextResponse.json(lancamento, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Erro ao criar lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
