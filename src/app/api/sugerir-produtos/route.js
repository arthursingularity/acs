import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Sugerir produtos cadastrados em um setor
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const centroCusto = searchParams.get('centroCusto');
        const query = searchParams.get('query');

        if (!centroCusto || !query || query.length < 2) {
            return NextResponse.json({ sugestoes: [] });
        }

        // Buscar o setor pelo centro de custo
        const setor = await prisma.setor.findUnique({
            where: { centroCusto },
        });

        if (!setor) {
            return NextResponse.json({ sugestoes: [] });
        }

        // Buscar todos os blocos do setor
        const blocks = await prisma.block.findMany({
            where: { setorId: setor.id },
        });

        const queryUpper = query.toUpperCase();
        const produtosSet = new Map(); // Usar Map para deduplicar por código

        blocks.forEach(block => {
            // Blocos simples
            if (block.tipo !== 'NIVEL' && block.produto && block.descricao) {
                if (block.descricao.toUpperCase().includes(queryUpper)) {
                    if (!produtosSet.has(block.produto)) {
                        produtosSet.set(block.produto, {
                            codigo: block.produto,
                            descricao: block.descricao,
                        });
                    }
                }
            }

            // Blocos com múltiplos endereços (tipo NIVEL)
            if (block.tipo === 'NIVEL' && block.enderecos) {
                let enderecos = block.enderecos;
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
                            if (end.descricao.toUpperCase().includes(queryUpper)) {
                                if (!produtosSet.has(end.produto)) {
                                    produtosSet.set(end.produto, {
                                        codigo: end.produto,
                                        descricao: end.descricao,
                                    });
                                }
                            }
                        }
                    });
                }
            }
        });

        // Converter Map para array e limitar a 10 resultados
        const sugestoes = Array.from(produtosSet.values()).slice(0, 10);

        return NextResponse.json({ sugestoes });
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        return NextResponse.json({ sugestoes: [] });
    }
}
