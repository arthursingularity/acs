import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar todos os setores
export async function GET() {
    try {
        const setores = await prisma.setor.findMany({
            orderBy: { centroCusto: 'asc' },
        });

        return NextResponse.json(setores);
    } catch (error) {
        console.error('Erro ao buscar setores:', error);
        return NextResponse.json({ error: 'Erro ao buscar setores' }, { status: 500 });
    }
}

// POST - Criar novo setor
export async function POST(request) {
    try {
        const { centroCusto, descricao, almoxarifado } = await request.json();

        const setor = await prisma.setor.create({
            data: {
                centroCusto,
                descricao,
                almoxarifado,
            },
        });

        return NextResponse.json(setor);
    } catch (error) {
        console.error('Erro ao criar setor:', error);
        return NextResponse.json({ error: 'Erro ao criar setor' }, { status: 500 });
    }
}

// PUT - Atualizar setor
export async function PUT(request) {
    try {
        const { centroCusto, descricao, almoxarifado } = await request.json();

        const setor = await prisma.setor.update({
            where: { centroCusto },
            data: {
                descricao,
                almoxarifado,
            },
        });

        return NextResponse.json({ success: true, setor });
    } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        return NextResponse.json({ error: 'Erro ao atualizar setor' }, { status: 500 });
    }
}
