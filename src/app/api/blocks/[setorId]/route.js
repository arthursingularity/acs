import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar todos os blocos de um setor
export async function GET(request, { params }) {
    try {
        const { setorId } = await params;

        const blocks = await prisma.block.findMany({
            where: { setorId },
        });

        // Converter para formato de objeto { "row-col": data }
        const gridData = {};
        blocks.forEach(block => {
            const { gridKey, ...data } = block;
            gridData[gridKey] = {
                type: data.type,
                rua: data.rua,
                coluna: data.coluna,
                nivel: data.nivel,
                tipo: data.tipo,
                altura: data.altura,
                produto: data.produto,
                descricao: data.descricao,
                observacao: data.observacao,
                tipoCaixa: data.tipoCaixa,
                blockColor: data.blockColor,
                almo: data.almo,
                enderecos: data.enderecos,
            };
        });

        return NextResponse.json(gridData);
    } catch (error) {
        console.error('Erro ao buscar blocos:', error);
        return NextResponse.json({ error: 'Erro ao buscar blocos' }, { status: 500 });
    }
}

// PUT - Salvar/Atualizar todos os blocos de um setor
export async function PUT(request, { params }) {
    try {
        const { setorId } = await params;
        const gridData = await request.json();

        // Deletar todos os blocos existentes do setor
        await prisma.block.deleteMany({
            where: { setorId },
        });

        // Inserir novos blocos
        const blocksToCreate = Object.entries(gridData).map(([gridKey, data]) => ({
            gridKey,
            setorId,
            type: data.type || 'endereco',
            rua: data.rua || null,
            coluna: data.coluna || null,
            nivel: data.nivel || null,
            tipo: data.tipo || null,
            altura: data.altura || null,
            produto: data.produto || null,
            descricao: data.descricao || null,
            observacao: data.observacao || null,
            tipoCaixa: data.tipoCaixa || null,
            blockColor: data.blockColor || 'gray',
            almo: data.almo || null,
            enderecos: data.enderecos || null,
        }));

        if (blocksToCreate.length > 0) {
            await prisma.block.createMany({
                data: blocksToCreate,
            });
        }

        return NextResponse.json({ success: true, count: blocksToCreate.length });
    } catch (error) {
        console.error('Erro ao salvar blocos:', error);
        return NextResponse.json({ error: 'Erro ao salvar blocos' }, { status: 500 });
    }
}

// PATCH - Atualizar um único bloco
export async function PATCH(request, { params }) {
    try {
        const { setorId } = await params;
        const { gridKey, data } = await request.json();

        if (!gridKey) {
            return NextResponse.json({ error: 'gridKey é obrigatório' }, { status: 400 });
        }

        // Upsert - criar ou atualizar
        const block = await prisma.block.upsert({
            where: {
                setorId_gridKey: { setorId, gridKey }
            },
            update: {
                type: data.type || 'endereco',
                rua: data.rua || null,
                coluna: data.coluna || null,
                nivel: data.nivel || null,
                tipo: data.tipo || null,
                altura: data.altura || null,
                produto: data.produto || null,
                descricao: data.descricao || null,
                observacao: data.observacao || null,
                tipoCaixa: data.tipoCaixa || null,
                blockColor: data.blockColor || 'gray',
                almo: data.almo || null,
                enderecos: data.enderecos || null,
            },
            create: {
                gridKey,
                setorId,
                type: data.type || 'endereco',
                rua: data.rua || null,
                coluna: data.coluna || null,
                nivel: data.nivel || null,
                tipo: data.tipo || null,
                altura: data.altura || null,
                produto: data.produto || null,
                descricao: data.descricao || null,
                observacao: data.observacao || null,
                tipoCaixa: data.tipoCaixa || null,
                blockColor: data.blockColor || 'gray',
                almo: data.almo || null,
                enderecos: data.enderecos || null,
            },
        });

        return NextResponse.json({ success: true, block });
    } catch (error) {
        console.error('Erro ao atualizar bloco:', error);
        return NextResponse.json({ error: 'Erro ao atualizar bloco' }, { status: 500 });
    }
}

// DELETE - Deletar um bloco específico
export async function DELETE(request, { params }) {
    try {
        const { setorId } = await params;
        const { searchParams } = new URL(request.url);
        const gridKey = searchParams.get('gridKey');

        if (!gridKey) {
            return NextResponse.json({ error: 'gridKey é obrigatório' }, { status: 400 });
        }

        await prisma.block.delete({
            where: {
                setorId_gridKey: { setorId, gridKey }
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar bloco:', error);
        return NextResponse.json({ error: 'Erro ao deletar bloco' }, { status: 500 });
    }
}
