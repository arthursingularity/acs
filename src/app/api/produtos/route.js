import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar todos os produtos
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');
        const busca = searchParams.get('busca');
        const centroCusto = searchParams.get('centroCusto');

        if (codigo) {
            // Buscar produto específico por código
            const produto = await prisma.produto.findUnique({
                where: { codigo },
            });

            if (!produto) {
                return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
            }

            return NextResponse.json(produto);
        }

        // Montar filtro
        const where = {};
        if (centroCusto) {
            if (centroCusto.includes(',')) {
                where.centroCusto = { in: centroCusto.split(',') };
            } else {
                where.centroCusto = centroCusto;
            }
        }

        if (busca && busca.length >= 2) {
            // Buscar produtos por descrição (para autocomplete)
            const produtos = await prisma.produto.findMany({
                where: {
                    ...where,
                    descricao: {
                        contains: busca.toUpperCase(),
                    },
                },
                take: 15,
                orderBy: { descricao: 'asc' },
            });

            return NextResponse.json({ sugestoes: produtos });
        }

        // Buscar todos
        const produtos = await prisma.produto.findMany({
            where,
            orderBy: { codigo: 'asc' },
        });

        return NextResponse.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
    }
}

// POST - Criar novo produto
export async function POST(request) {
    try {
        const { codigo, descricao, centroCusto, saldo } = await request.json();

        const produto = await prisma.produto.create({
            data: {
                codigo,
                descricao,
                centroCusto: centroCusto || "315111",
                saldo: saldo || 0,
            },
        });

        return NextResponse.json(produto);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
    }
}

// PUT - Atualizar produto ou bulk upsert
export async function PUT(request) {
    try {
        const body = await request.json();

        // Se for array, bulk upsert
        if (Array.isArray(body)) {
            const results = await Promise.all(
                body.map(p =>
                    prisma.produto.upsert({
                        where: { codigo: p.codigo || p.produto },
                        update: {
                            descricao: p.descricao,
                            ...(p.centroCusto && { centroCusto: p.centroCusto }),
                            ...(p.saldo !== undefined && { saldo: p.saldo }),
                        },
                        create: {
                            codigo: p.codigo || p.produto,
                            descricao: p.descricao,
                            centroCusto: p.centroCusto || "315111",
                            saldo: p.saldo || 0,
                        },
                    })
                )
            );

            return NextResponse.json({ success: true, count: results.length });
        }

        // Se for objeto único, atualizar
        const { id, codigo, descricao, centroCusto, saldo } = body;
        const updateData = {};
        if (descricao !== undefined) updateData.descricao = descricao;
        if (centroCusto !== undefined) updateData.centroCusto = centroCusto;
        if (saldo !== undefined) updateData.saldo = parseInt(saldo);

        const produto = await prisma.produto.update({
            where: { codigo: codigo || undefined, id: id || undefined },
            data: updateData,
        });

        return NextResponse.json(produto);
    } catch (error) {
        console.error('Erro ao atualizar produtos:', error);
        return NextResponse.json({ error: 'Erro ao atualizar produtos' }, { status: 500 });
    }
}

// DELETE - Remover produto
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');

        await prisma.produto.delete({ where: { codigo } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 });
    }
}
