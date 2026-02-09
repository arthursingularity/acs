import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar bens ou buscar por código/QR
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const codigo = searchParams.get("codigo");
        const qrCode = searchParams.get("qrCode");
        const centroCusto = searchParams.get("centroCusto");
        const search = searchParams.get("search");

        let where = {};

        if (codigo) {
            where.codigo = codigo;
        }
        if (qrCode) {
            where.OR = [{ qrCode: qrCode }, { codigo: qrCode }];
        }
        if (centroCusto) {
            where.centroCusto = centroCusto;
        }
        if (search) {
            where.OR = [
                { codigo: { contains: search, mode: "insensitive" } },
                { descricao: { contains: search, mode: "insensitive" } },
            ];
        }

        const bens = await prisma.bem.findMany({
            where,
            orderBy: { codigo: "asc" },
        });

        // Buscar todos os setores para mapear centroCusto -> descricao
        const setores = await prisma.setor.findMany({
            select: { centroCusto: true, descricao: true }
        });

        // Criar mapa de centroCusto -> descricao
        const setorMap = {};
        for (const setor of setores) {
            setorMap[setor.centroCusto] = setor.descricao;
        }

        // Adicionar localizacao baseada na descricao do centro de custo
        const bensComLocalizacao = bens.map(bem => ({
            ...bem,
            localizacao: setorMap[bem.centroCusto] || bem.localizacao || ''
        }));

        return NextResponse.json(bensComLocalizacao);
    } catch (error) {
        console.error("Erro ao buscar bens:", error);
        return NextResponse.json({ error: "Erro ao buscar bens" }, { status: 500 });
    }
}

// POST - Criar novo bem
export async function POST(request) {
    try {
        const body = await request.json();
        const { codigo, descricao, centroCusto, estacao, qrCode, status } = body;

        if (!codigo || !descricao || !centroCusto) {
            return NextResponse.json(
                { error: "Código, descrição e centro de custo são obrigatórios" },
                { status: 400 }
            );
        }

        // Buscar a descrição do centro de custo para usar como localização
        const setor = await prisma.setor.findUnique({
            where: { centroCusto: centroCusto?.toUpperCase() },
            select: { descricao: true }
        });

        const localizacaoFinal = setor?.descricao || '';

        // Converter campos de texto para maiúsculas
        const bem = await prisma.bem.create({
            data: {
                codigo: codigo?.toUpperCase(),
                descricao: descricao?.toUpperCase(),
                centroCusto: centroCusto?.toUpperCase(),
                estacao: estacao?.toUpperCase(),
                localizacao: localizacaoFinal?.toUpperCase(),
                qrCode: qrCode?.toUpperCase() || codigo?.toUpperCase(),
                status: status || "operacional",
            },
        });

        return NextResponse.json(bem, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar bem:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Código já existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro ao criar bem" }, { status: 500 });
    }
}

// PUT - Atualizar bem
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        // Converter campos de texto para maiúsculas
        const uppercaseFields = ['codigo', 'descricao', 'centroCusto', 'estacao', 'qrCode'];
        const updateData = { ...data };

        for (const field of uppercaseFields) {
            if (updateData[field] && typeof updateData[field] === 'string') {
                updateData[field] = updateData[field].toUpperCase();
            }
        }

        // Se centroCusto foi atualizado, buscar a nova descrição para localização
        if (updateData.centroCusto) {
            const setor = await prisma.setor.findUnique({
                where: { centroCusto: updateData.centroCusto },
                select: { descricao: true }
            });
            updateData.localizacao = setor?.descricao?.toUpperCase() || '';
        }

        const bem = await prisma.bem.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(bem);
    } catch (error) {
        console.error("Erro ao atualizar bem:", error);
        return NextResponse.json({ error: "Erro ao atualizar bem" }, { status: 500 });
    }
}

// DELETE - Remover bem
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        await prisma.bem.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao deletar bem:", error);
        return NextResponse.json({ error: "Erro ao deletar bem" }, { status: 500 });
    }
}
