import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        const token = await new SignJWT({ userId: user.id, username: user.username, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('8h')
            .sign(secret);

        const response = NextResponse.json({ success: true, user: { username: user.username, role: user.role } });

        // Set Cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Erro no login:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
