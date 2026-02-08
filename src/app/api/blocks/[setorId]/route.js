import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Função para converter campos de texto para maiúsculas
const toUpperSafe = (value) => {
    if (value && typeof value === 'string') {
        return value.toUpperCase();
    }
    return value;
};

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

        // 🛡️ PROTEÇÃO NIVEL 1: Impedir que um salvamento vazio ou inválido apague o banco de dados.
        // Isso previne que bugs no frontend (ex: state não carregado) disparando auto-save limpem o setor.
        if (!gridData || Object.keys(gridData).length === 0) {
            console.warn(`[PROTEÇÃO] Tentativa de sobrescrever setor ${setorId} com grid vazio bloqueada.`);
            return NextResponse.json({
                error: 'O grid parece estar vazio. O salvamento foi bloqueado para prevenir perda total de dados.'
            }, { status: 400 });
        }

        const blocksToCreate = Object.entries(gridData).map(([gridKey, data]) => ({
            gridKey,
            setorId,
            type: data.type || 'endereco',
            rua: toUpperSafe(data.rua) || null,
            coluna: toUpperSafe(data.coluna) || null,
            nivel: toUpperSafe(data.nivel) || null,
            tipo: toUpperSafe(data.tipo) || null,
            altura: toUpperSafe(data.altura) || null,
            produto: toUpperSafe(data.produto) || null,
            descricao: toUpperSafe(data.descricao) || null,
            observacao: toUpperSafe(data.observacao) || null,
            tipoCaixa: toUpperSafe(data.tipoCaixa) || null,
            blockColor: data.blockColor || 'gray',
            almo: toUpperSafe(data.almo) || null,
            enderecos: data.enderecos || null,
        }));

        // 🛡️ PROTEÇÃO NIVEL 2: Transação Atômica
        // Garante que a deleção dos dados antigos só seja confirmada se a inserção dos novos funcionar.
        await prisma.$transaction(async (tx) => {
            // 1. Deletar todos os blocos existentes do setor
            await tx.block.deleteMany({
                where: { setorId },
            });

            // 2. Inserir novos blocos
            if (blocksToCreate.length > 0) {
                await tx.block.createMany({
                    data: blocksToCreate,
                });
            }
        });

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

        // Upsert - criar ou atualizar (com conversão para maiúsculas)
        const block = await prisma.block.upsert({
            where: {
                setorId_gridKey: { setorId, gridKey }
            },
            update: {
                type: data.type || 'endereco',
                rua: toUpperSafe(data.rua) || null,
                coluna: toUpperSafe(data.coluna) || null,
                nivel: toUpperSafe(data.nivel) || null,
                tipo: toUpperSafe(data.tipo) || null,
                altura: toUpperSafe(data.altura) || null,
                produto: toUpperSafe(data.produto) || null,
                descricao: toUpperSafe(data.descricao) || null,
                observacao: toUpperSafe(data.observacao) || null,
                tipoCaixa: toUpperSafe(data.tipoCaixa) || null,
                blockColor: data.blockColor || 'gray',
                almo: toUpperSafe(data.almo) || null,
                enderecos: data.enderecos || null,
            },
            create: {
                gridKey,
                setorId,
                type: data.type || 'endereco',
                rua: toUpperSafe(data.rua) || null,
                coluna: toUpperSafe(data.coluna) || null,
                nivel: toUpperSafe(data.nivel) || null,
                tipo: toUpperSafe(data.tipo) || null,
                altura: toUpperSafe(data.altura) || null,
                produto: toUpperSafe(data.produto) || null,
                descricao: toUpperSafe(data.descricao) || null,
                observacao: toUpperSafe(data.observacao) || null,
                tipoCaixa: toUpperSafe(data.tipoCaixa) || null,
                blockColor: data.blockColor || 'gray',
                almo: toUpperSafe(data.almo) || null,
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
