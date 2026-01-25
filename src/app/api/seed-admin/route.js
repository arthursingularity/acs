import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST - Criar usuário admin inicial
export async function POST() {
    try {
        const username = "ARTHURM";
        const passwordRaw = "159357";

        // Hash da senha
        const hashedPassword = await bcrypt.hash(passwordRaw, 10);

        const user = await prisma.user.upsert({
            where: { username },
            update: {
                password: hashedPassword,
                role: 'admin'
            },
            create: {
                username,
                password: hashedPassword,
                name: "Admin Arthur",
                role: 'admin',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Usuário Admin criado com sucesso!',
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('Erro ao criar admin:', error);
        return NextResponse.json({ error: 'Erro ao criar admin', details: error.message }, { status: 500 });
    }
}
