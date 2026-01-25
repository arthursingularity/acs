import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar setor por centroCusto
export async function GET(request, { params }) {
    try {
        const { centroCusto } = await params;

        const setor = await prisma.setor.findUnique({
            where: { centroCusto },
        });

        if (!setor) {
            return NextResponse.json({ error: 'Setor não encontrado' }, { status: 404 });
        }

        return NextResponse.json(setor);
    } catch (error) {
        console.error('Erro ao buscar setor:', error);
        return NextResponse.json({ error: 'Erro ao buscar setor' }, { status: 500 });
    }
}

// PUT - Atualizar setor
export async function PUT(request, { params }) {
    try {
        const { centroCusto } = await params;
        const { descricao, almoxarifado } = await request.json();

        const setor = await prisma.setor.update({
            where: { centroCusto },
            data: { descricao, almoxarifado },
        });

        return NextResponse.json(setor);
    } catch (error) {
        console.error('Erro ao atualizar setor:', error);
        return NextResponse.json({ error: 'Erro ao atualizar setor' }, { status: 500 });
    }
}

// DELETE - Deletar setor (cascata para blocks)
export async function DELETE(request, { params }) {
    try {
        const { centroCusto } = await params;

        await prisma.setor.delete({
            where: { centroCusto },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar setor:', error);
        return NextResponse.json({ error: 'Erro ao deletar setor' }, { status: 500 });
    }
}
