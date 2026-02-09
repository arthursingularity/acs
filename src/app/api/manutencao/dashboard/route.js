import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Dados do dashboard em tempo real
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const centroCusto = searchParams.get("centroCusto");

        let where = {};
        if (centroCusto) {
            where.centroCusto = centroCusto;
        }

        // Buscar estatísticas gerais
        const [
            totalAbertas,
            totalEmFila,
            totalEmExecucao,
            totalPausadas,
            totalConcluidasTecnica,
            totalEncerradas,
            tecnicos,
            ordensEmExecucao,
            ordensEmFila,
            ordensPausadas
        ] = await Promise.all([
            prisma.ordemServico.count({ where: { ...where, status: "aberta" } }),
            prisma.ordemServico.count({ where: { ...where, status: "em_fila" } }),
            prisma.ordemServico.count({ where: { ...where, status: "em_execucao" } }),
            prisma.ordemServico.count({ where: { ...where, status: "pausada" } }),
            prisma.ordemServico.count({ where: { ...where, status: "concluida_tecnica" } }),
            prisma.ordemServico.count({
                where: {
                    ...where,
                    status: "encerrada",
                    dataEncerramento: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            prisma.tecnico.findMany({
                where: { ativo: true },
                include: {
                    ordensServico: {
                        where: {
                            status: { in: ["em_execucao", "pausada"] }
                        },
                        include: {
                            bem: true,
                            pausas: {
                                where: { dataFim: null },
                                include: { motivoPausa: true }
                            }
                        }
                    }
                }
            }),
            prisma.ordemServico.findMany({
                where: { ...where, status: "em_execucao" },
                include: {
                    bem: true,
                    tecnico: true
                },
                orderBy: { dataInicio: "asc" }
            }),
            prisma.ordemServico.findMany({
                where: { ...where, status: "em_fila" },
                include: {
                    bem: true,
                    tecnico: true
                },
                orderBy: [
                    { prioridade: "desc" },
                    { dataAbertura: "asc" }
                ]
            }),
            prisma.ordemServico.findMany({
                where: { ...where, status: "pausada" },
                include: {
                    bem: true,
                    tecnico: true,
                    pausas: {
                        where: { dataFim: null },
                        include: { motivoPausa: true }
                    }
                },
                orderBy: { dataInicio: "asc" }
            })
        ]);

        // Calcular status dos técnicos
        const tecnicosStatus = tecnicos.map(tecnico => {
            const osAtiva = tecnico.ordensServico.find(os => os.status === "em_execucao");
            const osPausada = tecnico.ordensServico.find(os => os.status === "pausada");

            let status = "disponivel";
            let osAtual = null;
            let motivoPausa = null;

            if (osAtiva) {
                status = "em_execucao";
                osAtual = osAtiva;
            } else if (osPausada) {
                status = "pausado";
                osAtual = osPausada;
                motivoPausa = osPausada.pausas[0]?.motivoPausa?.descricao;
            }

            return {
                id: tecnico.id,
                nome: tecnico.nome,
                matricula: tecnico.matricula,
                especialidade: tecnico.especialidade,
                status,
                osAtual: osAtual ? {
                    numero: osAtual.numero,
                    bem: osAtual.bem?.descricao,
                    localizacao: osAtual.bem?.localizacao || '',
                    centroCusto: osAtual.centroCusto || '',
                    dataInicio: osAtual.dataInicio
                } : null,
                motivoPausa
            };
        });

        // Ordenar por prioridade
        const prioridadeOrdem = { urgente: 4, alta: 3, normal: 2, baixa: 1 };
        const ordenarPorPrioridade = (ordens) => {
            return ordens.sort((a, b) => {
                const prioA = prioridadeOrdem[a.prioridade] || 0;
                const prioB = prioridadeOrdem[b.prioridade] || 0;
                if (prioA !== prioB) return prioB - prioA;
                return new Date(a.dataAbertura) - new Date(b.dataAbertura);
            });
        };

        return NextResponse.json({
            resumo: {
                abertas: totalAbertas,
                emFila: totalEmFila,
                emExecucao: totalEmExecucao,
                pausadas: totalPausadas,
                concluidasTecnica: totalConcluidasTecnica,
                encerradasHoje: totalEncerradas
            },
            tecnicos: tecnicosStatus,
            ordensEmExecucao,
            ordensEmFila: ordenarPorPrioridade(ordensEmFila),
            ordensPausadas,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Erro ao buscar dashboard:", error);
        return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
    }
}
