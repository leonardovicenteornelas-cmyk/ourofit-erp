// GET /api/categorias — Lista todas as categorias ativas para popular dropdowns
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      orderBy: [{ tipo: "asc" }, { ordem: "asc" }],
      select: {
        id: true,
        nome: true,
        tipo: true,
        icone: true,
      },
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
