import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Listar usuários
export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, name: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }
}

// POST - Criar usuário
export async function POST(request) {
    try {
        const { username, password, name, role } = await request.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                role: role || 'user',
            },
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao criar usuário (possível duplicidade)' }, { status: 500 });
    }
}


// PUT - Atualizar usuário
export async function PUT(request) {
    try {
        const { id, username, password, name, role } = await request.json();

        const data = {
            username,
            name,
            role,
        };

        // Só atualiza senha se for fornecida
        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data,
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
    }
}

// DELETE - Remover usuário
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 });
    }
}
