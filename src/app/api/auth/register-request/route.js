import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Listar solicitações pendentes (Admin)
export async function GET() {
    try {
        const requests = await prisma.registrationRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
        return NextResponse.json({ error: 'Erro ao buscar solicitações' }, { status: 500 });
    }
}

// POST - Criar nova solicitação de cadastro (Público)
export async function POST(request) {
    try {
        const { username, password, name } = await request.json();

        if (!username || !password || !name) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
        }

        // Verificar se usuário já existe
        const existingUser = await prisma.user.findFirst({
            where: { username: username.toUpperCase() },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Usuário já cadastrado no sistema' }, { status: 400 });
        }

        // Verificar se já existe solicitação pendente
        const existingRequest = await prisma.registrationRequest.findFirst({
            where: { username: username.toUpperCase() },
        });

        if (existingRequest) {
            return NextResponse.json({ error: 'Já existe uma solicitação pendente para este usuário' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newRequest = await prisma.registrationRequest.create({
            data: {
                username: username.toUpperCase(),
                password: hashedPassword,
                name: name.toUpperCase(),
            },
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        console.error("Erro ao criar solicitação:", error);
        return NextResponse.json({ error: 'Erro ao criar solicitação' }, { status: 500 });
    }
}

// PUT - Aprovar solicitação (Admin)
export async function PUT(request) {
    try {
        const { id } = await request.json();

        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        const registrationRequest = await prisma.registrationRequest.findUnique({
            where: { id },
        });

        if (!registrationRequest) {
            return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
        }

        // Criar usuário final
        const newUser = await prisma.user.create({
            data: {
                username: registrationRequest.username,
                password: registrationRequest.password, // Já está hashada
                name: registrationRequest.name,
                role: 'user', // Padrão user
            },
        });

        // Deletar solicitação após aprovar
        await prisma.registrationRequest.delete({ where: { id } });

        return NextResponse.json({ success: true, user: newUser });
    } catch (error) {
        console.error("Erro ao aprovar solicitação:", error);
        return NextResponse.json({ error: 'Erro ao aprovar solicitação' }, { status: 500 });
    }
}

// DELETE - Recusar solicitação (Admin)
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

        await prisma.registrationRequest.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao recusar solicitação:", error);
        return NextResponse.json({ error: 'Erro ao recusar solicitação' }, { status: 500 });
    }
}
