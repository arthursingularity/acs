import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar motivos de pausa
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ativo = searchParams.get("ativo");

        let where = {};
        if (ativo !== null) {
            where.ativo = ativo === "true";
        }

        const motivos = await prisma.motivoPausa.findMany({
            where,
            orderBy: { descricao: "asc" }
        });

        return NextResponse.json(motivos);
    } catch (error) {
        console.error("Erro ao buscar motivos:", error);
        return NextResponse.json({ error: "Erro ao buscar motivos" }, { status: 500 });
    }
}

// POST - Criar motivo de pausa
export async function POST(request) {
    try {
        const body = await request.json();
        const { codigo, descricao } = body;

        if (!codigo || !descricao) {
            return NextResponse.json(
                { error: "Código e descrição são obrigatórios" },
                { status: 400 }
            );
        }

        const motivo = await prisma.motivoPausa.create({
            data: { codigo, descricao }
        });

        return NextResponse.json(motivo, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar motivo:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Código já existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro ao criar motivo" }, { status: 500 });
    }
}

// PUT - Atualizar motivo
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        const motivo = await prisma.motivoPausa.update({
            where: { id },
            data
        });

        return NextResponse.json(motivo);
    } catch (error) {
        console.error("Erro ao atualizar motivo:", error);
        return NextResponse.json({ error: "Erro ao atualizar motivo" }, { status: 500 });
    }
}
