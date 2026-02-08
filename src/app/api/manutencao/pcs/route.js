import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET - Listar PCS por tipo
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get("tipo"); // problema, causa, solucao
        const ativo = searchParams.get("ativo");

        let where = {};
        if (ativo !== null) {
            where.ativo = ativo === "true";
        }

        let items = [];

        if (tipo === "problema" || !tipo) {
            const problemas = await prisma.problemaOS.findMany({ where, orderBy: { descricao: "asc" } });
            items = [...items, ...problemas.map(p => ({ ...p, tipo: "problema" }))];
        }
        if (tipo === "causa" || !tipo) {
            const causas = await prisma.causaOS.findMany({ where, orderBy: { descricao: "asc" } });
            items = [...items, ...causas.map(c => ({ ...c, tipo: "causa" }))];
        }
        if (tipo === "solucao" || !tipo) {
            const solucoes = await prisma.solucaoOS.findMany({ where, orderBy: { descricao: "asc" } });
            items = [...items, ...solucoes.map(s => ({ ...s, tipo: "solucao" }))];
        }

        return NextResponse.json(items);
    } catch (error) {
        console.error("Erro ao buscar PCS:", error);
        return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
    }
}

// POST - Criar PCS
export async function POST(request) {
    try {
        const body = await request.json();
        const { tipo, codigo, descricao } = body;

        if (!tipo || !codigo || !descricao) {
            return NextResponse.json(
                { error: "Tipo, código e descrição são obrigatórios" },
                { status: 400 }
            );
        }

        let item;
        if (tipo === "problema") {
            item = await prisma.problemaOS.create({ data: { codigo, descricao } });
        } else if (tipo === "causa") {
            item = await prisma.causaOS.create({ data: { codigo, descricao } });
        } else if (tipo === "solucao") {
            item = await prisma.solucaoOS.create({ data: { codigo, descricao } });
        } else {
            return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
        }

        return NextResponse.json({ ...item, tipo }, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar PCS:", error);
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Código já existe" }, { status: 400 });
        }
        return NextResponse.json({ error: "Erro ao criar" }, { status: 500 });
    }
}

// PUT - Atualizar PCS
export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, tipo, ...data } = body;

        if (!id || !tipo) {
            return NextResponse.json({ error: "ID e tipo são obrigatórios" }, { status: 400 });
        }

        let item;
        if (tipo === "problema") {
            item = await prisma.problemaOS.update({ where: { id }, data });
        } else if (tipo === "causa") {
            item = await prisma.causaOS.update({ where: { id }, data });
        } else if (tipo === "solucao") {
            item = await prisma.solucaoOS.update({ where: { id }, data });
        } else {
            return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
        }

        return NextResponse.json({ ...item, tipo });
    } catch (error) {
        console.error("Erro ao atualizar PCS:", error);
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}
