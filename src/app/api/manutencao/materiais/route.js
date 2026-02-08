import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar materiais de uma OS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ordemServicoId = searchParams.get("ordemServicoId");

        if (!ordemServicoId) {
            return NextResponse.json({ error: "ID da ordem é obrigatório" }, { status: 400 });
        }

        const materiais = await prisma.materialOS.findMany({
            where: { ordemServicoId },
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json(materiais);
    } catch (error) {
        console.error("Erro ao buscar materiais:", error);
        return NextResponse.json({ error: "Erro ao buscar materiais" }, { status: 500 });
    }
}

// POST - Adicionar material
export async function POST(request) {
    try {
        const body = await request.json();
        const { ordemServicoId, codigoProduto, descricao, quantidade, unidade } = body;

        if (!ordemServicoId || !codigoProduto || !descricao || !quantidade) {
            return NextResponse.json(
                { error: "Ordem, código, descrição e quantidade são obrigatórios" },
                { status: 400 }
            );
        }

        const material = await prisma.materialOS.create({
            data: {
                ordemServicoId,
                codigoProduto,
                descricao,
                quantidade: parseFloat(quantidade),
                unidade
            }
        });

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar material:", error);
        return NextResponse.json({ error: "Erro ao criar material" }, { status: 500 });
    }
}

// DELETE - Remover material
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        await prisma.materialOS.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar material:", error);
        return NextResponse.json({ error: "Erro ao deletar material" }, { status: 500 });
    }
}
