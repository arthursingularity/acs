import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar solicitações
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const centroCusto = searchParams.get('centroCusto'); // filtrar por CC do produto
        const tecnicoId = searchParams.get('tecnicoId');
        const produtoId = searchParams.get('produtoId');
        const status = searchParams.get('status');
        const tipo = searchParams.get('tipo'); // "necessidades" = agrupado por produto

        const where = {};
        if (tecnicoId) where.tecnicoId = tecnicoId;
        if (produtoId) where.produtoId = produtoId;
        if (status) {
            if (status.includes(',')) {
                where.status = { in: status.split(',') };
            } else {
                where.status = status;
            }
        } else {
            // Por padrão, só mostra pendentes e parciais
            where.status = { in: ['pendente', 'parcial'] };
        }

        // Se tem centroCusto, filtrar por produto.centroCusto
        if (centroCusto) {
            where.produto = { centroCusto: centroCusto };
        }

        // Se tipo = "necessidades", retorna soma agrupada por produto
        if (tipo === 'necessidades') {
            const solicitacoes = await prisma.solicitacaoAlmoxarifado.findMany({
                where,
                include: {
                    produto: true,
                    tecnico: true,
                },
                orderBy: { criadoEm: 'desc' },
            });

            // Agrupar por produtoId
            const agrupado = {};
            solicitacoes.forEach(s => {
                if (!agrupado[s.produtoId]) {
                    agrupado[s.produtoId] = {
                        produtoId: s.produtoId,
                        produtoCodigo: s.produto.codigo,
                        produtoDescricao: s.produto.descricao,
                        totalSolicitado: 0,
                        totalAtendido: 0,
                        solicitacoes: [],
                    };
                }
                agrupado[s.produtoId].totalSolicitado += s.quantidade;
                agrupado[s.produtoId].totalAtendido += s.quantidadeAtendida;
                agrupado[s.produtoId].solicitacoes.push(s);
            });

            return NextResponse.json(Object.values(agrupado));
        }

        // Busca normal com relações
        const solicitacoes = await prisma.solicitacaoAlmoxarifado.findMany({
            where,
            include: {
                produto: true,
                tecnico: true,
            },
            orderBy: { criadoEm: 'desc' },
        });

        return NextResponse.json(solicitacoes);
    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        return NextResponse.json({ error: 'Erro ao buscar solicitações' }, { status: 500 });
    }
}

// POST - Criar nova solicitação
export async function POST(request) {
    try {
        const { produtoId, tecnicoId, ordemServicoId, bemDescricao, bemLocalizacao, centroCusto, quantidade } = await request.json();

        if (!produtoId || !tecnicoId || !quantidade || quantidade < 1) {
            return NextResponse.json({ error: 'Dados obrigatórios: produtoId, tecnicoId, quantidade (>= 1)' }, { status: 400 });
        }

        const solicitacao = await prisma.solicitacaoAlmoxarifado.create({
            data: {
                produtoId,
                tecnicoId,
                ordemServicoId: ordemServicoId || null,
                bemDescricao: bemDescricao || null,
                bemLocalizacao: bemLocalizacao || null,
                centroCusto: centroCusto || null,
                quantidade: parseInt(quantidade),
                status: 'pendente',
            },
            include: {
                produto: true,
                tecnico: true,
            },
        });

        return NextResponse.json(solicitacao);
    } catch (error) {
        console.error('Erro ao criar solicitação:', error);
        return NextResponse.json({ error: 'Erro ao criar solicitação' }, { status: 500 });
    }
}

// PUT - Atualizar solicitação (editar quantidade ou atender)
export async function PUT(request) {
    try {
        const { id, acao, quantidade, quantidadeAtender } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        const solicitacao = await prisma.solicitacaoAlmoxarifado.findUnique({
            where: { id },
            include: { produto: true },
        });

        if (!solicitacao) {
            return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
        }

        // Ação: atender (almoxarifado envia peças)
        if (acao === 'atender') {
            const qtdAtender = parseInt(quantidadeAtender);
            if (!qtdAtender || qtdAtender < 1) {
                return NextResponse.json({ error: 'Quantidade a atender deve ser >= 1' }, { status: 400 });
            }

            const novoAtendido = solicitacao.quantidadeAtendida + qtdAtender;
            const novoStatus = novoAtendido >= solicitacao.quantidade ? 'atendida' : 'parcial';

            // Atualizar solicitação
            const atualizada = await prisma.solicitacaoAlmoxarifado.update({
                where: { id },
                data: {
                    quantidadeAtendida: novoAtendido,
                    status: novoStatus,
                },
                include: { produto: true, tecnico: true },
            });

            // Consumir saldo do produto
            await prisma.produto.update({
                where: { id: solicitacao.produtoId },
                data: {
                    saldo: { decrement: qtdAtender },
                },
            });

            return NextResponse.json(atualizada);
        }

        // Ação: editar quantidade
        if (acao === 'editar') {
            const novaQtd = parseInt(quantidade);
            if (!novaQtd || novaQtd < 1) {
                return NextResponse.json({ error: 'Quantidade deve ser >= 1' }, { status: 400 });
            }

            const atualizada = await prisma.solicitacaoAlmoxarifado.update({
                where: { id },
                data: { quantidade: novaQtd },
                include: { produto: true, tecnico: true },
            });

            return NextResponse.json(atualizada);
        }

        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    } catch (error) {
        console.error('Erro ao atualizar solicitação:', error);
        return NextResponse.json({ error: 'Erro ao atualizar solicitação' }, { status: 500 });
    }
}

// DELETE - Cancelar/remover solicitação
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        await prisma.solicitacaoAlmoxarifado.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar solicitação:', error);
        return NextResponse.json({ error: 'Erro ao deletar solicitação' }, { status: 500 });
    }
}
