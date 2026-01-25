import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar todos os produtos
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get('codigo');

        if (codigo) {
            // Buscar produto específico
            const produto = await prisma.produto.findUnique({
                where: { codigo },
            });

            if (!produto) {
                return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
            }

            return NextResponse.json(produto);
        }

        // Buscar todos
        const produtos = await prisma.produto.findMany({
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
        const { codigo, descricao } = await request.json();

        const produto = await prisma.produto.create({
            data: { codigo, descricao },
        });

        return NextResponse.json(produto);
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
    }
}

// PUT - Atualizar ou criar múltiplos produtos (bulk upsert)
export async function PUT(request) {
    try {
        const produtos = await request.json();

        const results = await Promise.all(
            produtos.map(p =>
                prisma.produto.upsert({
                    where: { codigo: p.codigo || p.produto },
                    update: { descricao: p.descricao },
                    create: { codigo: p.codigo || p.produto, descricao: p.descricao },
                })
            )
        );

        return NextResponse.json({ success: true, count: results.length });
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
