// Seed script para Prisma 7.x
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

// Dados dos setores (do Database.js original)
const SETORES_DB = [
    {
        descricao: "MONT FECHADURAS C",
        centroCusto: "317111",
        almoxarifado: "77",
    },
    {
        descricao: "MONT FECHADURAS A",
        centroCusto: "315111",
        almoxarifado: "75",
    },
    {
        descricao: "MONT FECHADURAS B",
        centroCusto: "316111",
        almoxarifado: "76",
    },
];

async function main() {
    console.log('🌱 Iniciando seed dos setores...');

    for (const setor of SETORES_DB) {
        const created = await prisma.setor.upsert({
            where: { centroCusto: setor.centroCusto },
            update: {
                descricao: setor.descricao,
                almoxarifado: setor.almoxarifado,
            },
            create: {
                centroCusto: setor.centroCusto,
                descricao: setor.descricao,
                almoxarifado: setor.almoxarifado,
            },
        });
        console.log(`✅ Setor criado: ${created.descricao} (${created.centroCusto})`);
    }

    console.log('🎉 Seed dos setores concluído!');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
