import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const token = request.cookies.get('auth_token')?.value;

    // Rotas públicas (não precisam de login)
    const publicRoutes = ['/login', '/api/auth/login', '/_next', '/favicon.ico'];

    // Verifica se é rota pública ou arquivo estático
    const isPublic = publicRoutes.some(path => request.nextUrl.pathname.startsWith(path)) ||
        request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg)$/);

    if (isPublic) {
        // Se o usuário já estiver logado e tentar ir para /login, manda para home
        if (token && request.nextUrl.pathname === '/login') {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
                await jwtVerify(token, secret);
                // Token valido, redireciona para home (ou primeira pagina disponivel)
                // Como o usuário pode não ter um setor, vamos mandar para a raiz e ele cria ou seleciona
                return NextResponse.redirect(new URL('/', request.url));
            } catch (err) {
                // Token invalido, deixa ir para /login
            }
        }
        return NextResponse.next();
    }

    // Verificar token para rotas protegidas
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-it');
        await jwtVerify(token, secret);
        return NextResponse.next();
    } catch (err) {
        // Token inválido ou expirado
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
