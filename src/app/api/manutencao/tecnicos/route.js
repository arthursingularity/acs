import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar técnicos
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ativo = searchParams.get("ativo");
        const especialidade = searchParams.get("especialidade");

        let where = {};

        if (ativo !== null) {
            where.ativo = ativo === "true";
        }
        if (especialidade) {
            where.especialidade = especialidade;
        }

        const tecnicos = await prisma.tecnico.findMany({
            where,
            orderBy: { nome: "asc" },
            include: {
                _count: {
                    select: {
                        ordensServico: {
                            where: {
                                status: { in: ["em_execucao", "pausada"] }
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(tecnicos);
    } catch (error) {
        console.error("Erro ao buscar técnicos:", error);
        return NextResponse.json({ error: "Erro ao buscar técnicos" }, { status: 500 });
    }
}

// POST - Criar novo técnico
export async function POST(request) {
    try {
        const body = await request.json();
        const { matricula, nome, especialidade, telefone, email } = body;

        if (!matricula || !nome || !especialidade) {
            return NextResponse.json(
                { error: "Matrícula, nome e especialidade são obrigatórios" },
                { status: 400 }
            );
        }

        const tecnico = await prisma.tecnico.create({
            data: {
                matricula,
                nome,
                especialidade,
                telefone,
                email,
            },
        });

        return NextResponse.json(tecnico, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar técnico:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Matrícula já existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro ao criar técnico" }, { status: 500 });
    }
}

// PUT - Atualizar técnico
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        const tecnico = await prisma.tecnico.update({
            where: { id },
            data,
        });

        return NextResponse.json(tecnico);
    } catch (error) {
        console.error("Erro ao atualizar técnico:", error);
        return NextResponse.json({ error: "Erro ao atualizar técnico" }, { status: 500 });
    }
}

// DELETE - Remover técnico (soft delete - apenas desativa)
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        await prisma.tecnico.update({
            where: { id },
            data: { ativo: false }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao desativar técnico:", error);
        return NextResponse.json({ error: "Erro ao desativar técnico" }, { status: 500 });
    }
}
