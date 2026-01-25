import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar configuração do grid
export async function GET(request, { params }) {
    try {
        const { setorId } = await params;

        let config = await prisma.gridConfig.findUnique({
            where: { setorId },
        });

        // Se não existir, criar com valores padrão
        if (!config) {
            config = await prisma.gridConfig.create({
                data: {
                    setorId,
                    cols: 50,
                    rows: 50,
                },
            });
        }

        return NextResponse.json({ cols: config.cols, rows: config.rows });
    } catch (error) {
        console.error('Erro ao buscar config:', error);
        return NextResponse.json({ error: 'Erro ao buscar config' }, { status: 500 });
    }
}

// PUT - Atualizar configuração do grid
export async function PUT(request, { params }) {
    try {
        const { setorId } = await params;
        const { cols, rows } = await request.json();

        const config = await prisma.gridConfig.upsert({
            where: { setorId },
            update: { cols, rows },
            create: { setorId, cols, rows },
        });

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('Erro ao salvar config:', error);
        return NextResponse.json({ error: 'Erro ao salvar config' }, { status: 500 });
    }
}
