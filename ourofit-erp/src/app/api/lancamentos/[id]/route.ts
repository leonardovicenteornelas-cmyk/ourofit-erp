// PUT /api/lancamentos/[id] — Editar lançamento
// DELETE /api/lancamentos/[id] — Excluir lançamento

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoLancamento, StatusPagamento } from "@prisma/client";

const editarSchema = z.object({
  tipo:        z.enum(["ENTRADA", "SAIDA"]).optional(),
  categoriaId: z.string().min(1).optional(),
  valor:       z.number().positive().optional(),
  data:        z.string().optional(),
  descricao:   z.string().optional().nullable(),
  fornecedor:  z.string().optional().nullable(),
  conta:       z.string().optional().nullable(),
  observacao:  z.string().optional().nullable(),
  status:      z.enum(["PAGO", "EM_ABERTO", "AGENDADO"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const dados = editarSchema.parse(body);

    type PrismaUpdateData = {
      tipo?: TipoLancamento;
      categoriaId?: string;
      valor?: number;
      data?: Date;
      descricao?: string | null;
      fornecedor?: string | null;
      conta?: string | null;
      observacao?: string | null;
      status?: StatusPagamento;
    };

    const updateData: PrismaUpdateData = {};
    if (dados.tipo)        updateData.tipo        = dados.tipo as TipoLancamento;
    if (dados.categoriaId) updateData.categoriaId = dados.categoriaId;
    if (dados.valor)       updateData.valor       = dados.valor;
    if (dados.data)        updateData.data        = new Date(dados.data);
    if (dados.status)      updateData.status      = dados.status as StatusPagamento;
    if ("descricao"  in dados) updateData.descricao  = dados.descricao  ?? null;
    if ("fornecedor" in dados) updateData.fornecedor = dados.fornecedor ?? null;
    if ("conta"      in dados) updateData.conta      = dados.conta      ?? null;
    if ("observacao" in dados) updateData.observacao = dados.observacao ?? null;

    const lancamento = await prisma.lancamento.update({
      where: { id },
      data: updateData,
      include: { categoria: { select: { nome: true, icone: true } } },
    });

    return NextResponse.json(lancamento);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    console.error("Erro ao editar lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.lancamento.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir lançamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
