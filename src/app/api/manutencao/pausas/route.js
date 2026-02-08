import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar pausas
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const ordemServicoId = searchParams.get("ordemServicoId");
        const tecnicoId = searchParams.get("tecnicoId");
        const ativas = searchParams.get("ativas");

        let where = {};

        if (ordemServicoId) where.ordemServicoId = ordemServicoId;
        if (tecnicoId) where.tecnicoId = tecnicoId;
        if (ativas === "true") where.dataFim = null;

        const pausas = await prisma.pausaOS.findMany({
            where,
            orderBy: { dataInicio: "desc" },
            include: {
                motivoPausa: true,
                tecnico: true,
                ordemServico: {
                    include: { bem: true }
                }
            }
        });

        return NextResponse.json(pausas);
    } catch (error) {
        console.error("Erro ao buscar pausas:", error);
        return NextResponse.json({ error: "Erro ao buscar pausas" }, { status: 500 });
    }
}

// POST - Iniciar pausa
export async function POST(request) {
    try {
        const body = await request.json();
        const { ordemServicoId, tecnicoId, motivoPausaId, observacao } = body;

        if (!ordemServicoId || !tecnicoId || !motivoPausaId) {
            return NextResponse.json(
                { error: "Ordem de serviço, técnico e motivo são obrigatórios" },
                { status: 400 }
            );
        }

        // Criar pausa e atualizar status da OS
        const [pausa] = await prisma.$transaction([
            prisma.pausaOS.create({
                data: {
                    ordemServicoId,
                    tecnicoId,
                    motivoPausaId,
                    observacao
                },
                include: {
                    motivoPausa: true,
                    tecnico: true
                }
            }),
            prisma.ordemServico.update({
                where: { id: ordemServicoId },
                data: { status: "pausada" }
            })
        ]);

        return NextResponse.json(pausa, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar pausa:", error);
        return NextResponse.json({ error: "Erro ao criar pausa" }, { status: 500 });
    }
}

// PUT - Finalizar pausa
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ordemServicoId } = body;

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        // Finalizar pausa e retomar OS
        const [pausa] = await prisma.$transaction([
            prisma.pausaOS.update({
                where: { id },
                data: { dataFim: new Date() },
                include: {
                    motivoPausa: true,
                    tecnico: true
                }
            }),
            ...(ordemServicoId ? [
                prisma.ordemServico.update({
                    where: { id: ordemServicoId },
                    data: { status: "em_execucao" }
                })
            ] : [])
        ]);

        return NextResponse.json(pausa);
    } catch (error) {
        console.error("Erro ao finalizar pausa:", error);
        return NextResponse.json({ error: "Erro ao finalizar pausa" }, { status: 500 });
    }
}
