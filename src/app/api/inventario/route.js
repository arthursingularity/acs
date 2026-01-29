import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar status de inventário de todos os setores
export async function GET() {
    try {
        const inventarios = await prisma.inventarioSetor.findMany();

        // Transformar em um objeto para fácil acesso
        const statusMap = {};
        inventarios.forEach(inv => {
            statusMap[inv.setorCodigo] = inv.emInventario;
        });

        return NextResponse.json(statusMap);
    } catch (error) {
        console.error('Erro ao buscar status de inventário:', error);
        return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
    }
}

// POST - Iniciar inventário para um setor
export async function POST(request) {
    try {
        const { setorCodigo } = await request.json();

        const inventario = await prisma.inventarioSetor.upsert({
            where: { setorCodigo },
            update: { emInventario: true },
            create: { setorCodigo, emInventario: true }
        });

        return NextResponse.json({ success: true, inventario });
    } catch (error) {
        console.error('Erro ao iniciar inventário:', error);
        return NextResponse.json({ error: 'Erro ao iniciar inventário' }, { status: 500 });
    }
}

// PUT - Finalizar inventário para um setor
export async function PUT(request) {
    try {
        const { setorCodigo } = await request.json();

        const inventario = await prisma.inventarioSetor.upsert({
            where: { setorCodigo },
            update: { emInventario: false },
            create: { setorCodigo, emInventario: false }
        });

        return NextResponse.json({ success: true, inventario });
    } catch (error) {
        console.error('Erro ao finalizar inventário:', error);
        return NextResponse.json({ error: 'Erro ao finalizar inventário' }, { status: 500 });
    }
}
