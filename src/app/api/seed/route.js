import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Seed dos setores iniciais
export async function POST() {
    try {
        const SETORES_DB = [
            { descricao: "MONT FECHADURAS C", centroCusto: "317111", almoxarifado: "77" },
            { descricao: "MONT FECHADURAS A", centroCusto: "315111", almoxarifado: "75" },
            { descricao: "MONT FECHADURAS B", centroCusto: "316111", almoxarifado: "76" },
        ];

        const results = [];

        for (const setor of SETORES_DB) {
            const created = await prisma.setor.upsert({
                where: { centroCusto: setor.centroCusto },
                update: { descricao: setor.descricao, almoxarifado: setor.almoxarifado },
                create: { centroCusto: setor.centroCusto, descricao: setor.descricao, almoxarifado: setor.almoxarifado },
            });
            results.push(created);
        }

        return NextResponse.json({
            success: true,
            message: 'Setores criados com sucesso!',
            setores: results
        });
    } catch (error) {
        console.error('Erro no seed:', error);
        return NextResponse.json({ error: 'Erro ao criar setores', details: error.message }, { status: 500 });
    }
}
