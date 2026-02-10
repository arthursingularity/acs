import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar ordens de serviço
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const tecnicoId = searchParams.get("tecnicoId");
        const centroCusto = searchParams.get("centroCusto");
        const bemId = searchParams.get("bemId");
        const prioridade = searchParams.get("prioridade");
        const numero = searchParams.get("numero");
        const limit = searchParams.get("limit");
        const tipo = searchParams.get("tipo"); // SS ou OS

        let where = {};

        if (status) {
            if (status.includes(",")) {
                where.status = { in: status.split(",") };
            } else {
                where.status = status;
            }
        }
        if (tecnicoId) where.tecnicoId = tecnicoId;
        if (centroCusto) where.centroCusto = centroCusto;
        if (bemId) where.bemId = bemId;
        if (prioridade) where.prioridade = prioridade;
        if (numero) where.numero = parseInt(numero);
        if (tipo) where.tipo = tipo;

        const ordens = await prisma.ordemServico.findMany({
            where,
            orderBy: [
                { prioridade: "desc" },
                { dataAbertura: "desc" }
            ],
            take: limit ? parseInt(limit) : undefined,
            include: {
                bem: true,
                tecnico: true,
                problema: true,
                causa: true,
                solucao: true,
                pausas: {
                    include: {
                        motivoPausa: true,
                        tecnico: true
                    },
                    orderBy: { dataInicio: "desc" }
                },
                anexos: true,
                materiais: true,
                _count: {
                    select: {
                        pausas: true,
                        anexos: true,
                        materiais: true
                    }
                }
            }
        });

        // Ordenar por prioridade (urgente > alta > normal > baixa)
        const prioridadeOrdem = { URGENTE: 4, ALTA: 3, NORMAL: 2, BAIXA: 1, urgente: 4, alta: 3, normal: 2, baixa: 1 };
        ordens.sort((a, b) => {
            const prioA = prioridadeOrdem[a.prioridade] || 0;
            const prioB = prioridadeOrdem[b.prioridade] || 0;
            if (prioA !== prioB) return prioB - prioA;
            return new Date(b.dataAbertura) - new Date(a.dataAbertura);
        });

        return NextResponse.json(ordens);
    } catch (error) {
        console.error("Erro ao buscar ordens:", error);
        return NextResponse.json({ error: "Erro ao buscar ordens" }, { status: 500 });
    }
}

// POST - Criar nova ordem de serviço
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            bemId,
            centroCusto,
            estacao,
            tipoManutencao,
            tipoManutencaoCategoria,
            prioridade,
            observacaoAbertura,
            solicitante,
            tipo // "SS" ou "OS"
        } = body;

        if (!bemId || !centroCusto || !tipoManutencao || !solicitante) {
            return NextResponse.json(
                { error: "Bem, centro de custo, tipo de manutenção e solicitante são obrigatórios" },
                { status: 400 }
            );
        }

        // Converter todos os campos de texto para maiúsculas
        const ordem = await prisma.ordemServico.create({
            data: {
                bemId,
                centroCusto: centroCusto?.toUpperCase(),
                estacao: estacao?.toUpperCase(),
                tipoManutencao: tipoManutencao?.toUpperCase(),
                tipoManutencaoCategoria: tipoManutencaoCategoria?.toUpperCase() || "CORRETIVA",
                prioridade: prioridade || "NORMAL",
                observacaoAbertura: observacaoAbertura?.toUpperCase(),
                solicitante: solicitante?.toUpperCase(),
                status: "aberta",
                tipo: tipo?.toUpperCase() || "OS"
            },
            include: {
                bem: true
            }
        });

        return NextResponse.json(ordem, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar ordem:", error);
        return NextResponse.json({ error: "Erro ao criar ordem de serviço" }, { status: 500 });
    }
}

// PUT - Atualizar ordem de serviço
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, acao, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        // Converter campos de texto para maiúsculas
        const uppercaseFields = ['centroCusto', 'estacao', 'tipoManutencao', 'tipoManutencaoCategoria', 'observacaoAbertura',
            'solicitante', 'observacaoTecnica', 'statusFinalBem', 'encerradoPor'];
        let updateData = { ...data };

        for (const field of uppercaseFields) {
            if (updateData[field] && typeof updateData[field] === 'string') {
                updateData[field] = updateData[field].toUpperCase();
            }
        }

        // Ações especiais
        if (acao === "atribuir" && data.tecnicoId) {
            // Buscar a ordem atual para verificar se é SS
            const ordemAtual = await prisma.ordemServico.findUnique({ where: { id } });

            updateData = {
                ...updateData,
                status: "em_fila",
                dataAtribuicao: new Date()
            };

            // Se for SS, converter para OS ao atribuir técnico
            if (ordemAtual && ordemAtual.tipo === "SS") {
                updateData.tipo = "OS";
            }

            // Se a prioridade foi enviada na atribuição, incluir
            if (data.prioridade) {
                updateData.prioridade = data.prioridade.toUpperCase();
            }
        } else if (acao === "iniciar") {
            updateData = {
                ...updateData,
                status: "em_execucao",
                dataInicio: new Date()
            };
        } else if (acao === "pausar") {
            updateData = {
                ...updateData,
                status: "pausada"
            };
        } else if (acao === "retomar") {
            updateData = {
                ...updateData,
                status: "em_execucao"
            };
        } else if (acao === "finalizar") {
            updateData = {
                ...updateData,
                status: "concluida_tecnica",
                dataFim: new Date()
            };
        } else if (acao === "encerrar") {
            updateData = {
                ...updateData,
                status: "encerrada",
                dataEncerramento: new Date()
            };
        }

        // Se estiver editando e atribuindo técnico a uma SS, converter para OS
        if (acao === "editar" && data.tecnicoId) {
            const ordemAtual = await prisma.ordemServico.findUnique({ where: { id } });
            if (ordemAtual && ordemAtual.tipo === "SS" && !ordemAtual.tecnicoId) {
                updateData.tipo = "OS";
            }
        }

        const ordem = await prisma.ordemServico.update({
            where: { id },
            data: updateData,
            include: {
                bem: true,
                tecnico: true,
                problema: true,
                causa: true,
                solucao: true
            }
        });

        return NextResponse.json(ordem);
    } catch (error) {
        console.error("Erro ao atualizar ordem:", error);
        return NextResponse.json({ error: "Erro ao atualizar ordem" }, { status: 500 });
    }
}

// DELETE - Excluir ordem de serviço permanentemente
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        // Primeiro excluir registros relacionados (pausas, materiais, anexos)
        // Usando os nomes corretos das tabelas conforme o schema Prisma
        await prisma.pausaOS.deleteMany({
            where: { ordemServicoId: id }
        });

        await prisma.materialOS.deleteMany({
            where: { ordemServicoId: id }
        });

        await prisma.anexoOS.deleteMany({
            where: { ordemServicoId: id }
        });

        // Agora excluir a ordem de serviço
        await prisma.ordemServico.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao excluir ordem:", error);
        return NextResponse.json({ error: "Erro ao excluir ordem de serviço" }, { status: 500 });
    }
}
