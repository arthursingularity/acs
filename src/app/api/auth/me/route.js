import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        const { payload } = await jwtVerify(token, secret);

        return NextResponse.json({
            user: {
                id: payload.userId,
                username: payload.username,
                role: payload.role
            }
        });
    } catch (err) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
}
