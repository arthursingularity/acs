import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar endereços de um produto por centro de custo
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const centroCusto = searchParams.get('centroCusto');
        const query = searchParams.get('query'); // Código ou descrição do produto

        if (!centroCusto || !query) {
            return NextResponse.json(
                { error: 'centroCusto e query são obrigatórios' },
                { status: 400 }
            );
        }

        // Buscar o setor pelo centro de custo
        const setor = await prisma.setor.findUnique({
            where: { centroCusto },
        });

        if (!setor) {
            return NextResponse.json(
                { error: 'Setor não encontrado' },
                { status: 404 }
            );
        }

        // Buscar todos os blocos do setor
        const blocks = await prisma.block.findMany({
            where: { setorId: setor.id },
        });

        const queryUpper = query.toUpperCase();
        const resultados = [];

        blocks.forEach(block => {
            // Verificar blocos simples (tipo COLUNA ou sem tipo NIVEL)
            if (block.tipo !== 'NIVEL') {
                if (block.produto && block.descricao) {
                    const matchProduto = block.produto.toUpperCase().includes(queryUpper);
                    const matchDescricao = block.descricao.toUpperCase().includes(queryUpper);

                    if (matchProduto || matchDescricao) {
                        const endereco = `${block.almo || ''}${block.rua || ''}${block.coluna || ''}N${block.nivel || '1'}`;
                        resultados.push({
                            endereco,
                            produto: block.produto,
                            descricao: block.descricao,
                            rua: block.rua,
                            coluna: block.coluna,
                            nivel: block.nivel || '1',
                            observacao: block.observacao || '',
                            tipoCaixa: block.tipoCaixa || '',
                        });
                    }
                }
            }

            // Verificar blocos com múltiplos endereços (tipo NIVEL/gaveteiro)
            if (block.tipo === 'NIVEL' && block.enderecos) {
                let enderecos = block.enderecos;

                // Se for string, parsing JSON
                if (typeof enderecos === 'string') {
                    try {
                        enderecos = JSON.parse(enderecos);
                    } catch (e) {
                        return;
                    }
                }

                if (Array.isArray(enderecos)) {
                    enderecos.forEach(end => {
                        if (end.produto && end.descricao) {
                            const matchProduto = end.produto.toUpperCase().includes(queryUpper);
                            const matchDescricao = end.descricao.toUpperCase().includes(queryUpper);

                            if (matchProduto || matchDescricao) {
                                resultados.push({
                                    endereco: end.enderecoCode || `${block.almo || ''}${end.rua || ''}${end.coluna || ''}N${end.nivel || ''}`,
                                    produto: end.produto,
                                    descricao: end.descricao,
                                    rua: end.rua || block.rua,
                                    coluna: end.coluna || block.coluna,
                                    nivel: end.nivel,
                                    observacao: end.observacao || '',
                                    tipoCaixa: block.tipoCaixa || '',
                                    divisoria: end.divisoria || null,
                                });
                            }
                        }
                    });
                }
            }
        });

        return NextResponse.json({
            setor: {
                centroCusto: setor.centroCusto,
                descricao: setor.descricao,
                almoxarifado: setor.almoxarifado,
            },
            query,
            total: resultados.length,
            enderecos: resultados,
        });
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        return NextResponse.json({ error: 'Erro ao buscar endereços' }, { status: 500 });
    }
}
