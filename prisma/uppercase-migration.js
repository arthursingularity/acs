/**
 * Script para converter todos os dados de texto do banco de dados para MAIÚSCULAS
 * Execute com: node prisma/uppercase-migration.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Campos de texto que devem ser convertidos para maiúsculas por modelo
const modelsToUpdate = {
    setor: ['descricao', 'almoxarifado'],
    produto: ['descricao'],
    block: ['rua', 'coluna', 'nivel', 'tipo', 'altura', 'produto', 'descricao', 'observacao', 'tipoCaixa', 'almo'],
    user: ['username', 'name'],
    bem: ['descricao', 'centroCusto', 'estacao', 'localizacao'],
    tecnico: ['nome', 'especialidade', 'email'],
    ordemServico: ['centroCusto', 'estacao', 'tipoManutencao', 'prioridade', 'observacaoAbertura', 'solicitante', 'observacaoTecnica', 'statusFinalBem', 'encerradoPor'],
    motivoPausa: ['descricao'],
    materialOS: ['descricao', 'unidade'],
    anexoOS: ['descricao'],
    problemaOS: ['descricao'],
    causaOS: ['descricao'],
    solucaoOS: ['descricao'],
    pausaOS: ['observacao']
};

async function updateModel(modelName, fields) {
    console.log(`\n🔄 Atualizando modelo: ${modelName}`);

    try {
        // Obter todos os registros
        const records = await prisma[modelName].findMany();
        console.log(`   Encontrados ${records.length} registros`);

        let updatedCount = 0;

        for (const record of records) {
            const updateData = {};
            let hasChanges = false;

            for (const field of fields) {
                if (record[field] && typeof record[field] === 'string') {
                    const upperValue = record[field].toUpperCase();
                    if (upperValue !== record[field]) {
                        updateData[field] = upperValue;
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges) {
                await prisma[modelName].update({
                    where: { id: record.id },
                    data: updateData
                });
                updatedCount++;
            }
        }

        console.log(`   ✅ ${updatedCount} registros atualizados`);
        return updatedCount;
    } catch (error) {
        console.error(`   ❌ Erro ao atualizar ${modelName}: ${error.message}`);
        return 0;
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('🔠 MIGRAÇÃO PARA MAIÚSCULAS');
    console.log('='.repeat(60));
    console.log('\nIniciando conversão de todos os dados para MAIÚSCULAS...\n');

    let totalUpdated = 0;

    for (const [modelName, fields] of Object.entries(modelsToUpdate)) {
        const count = await updateModel(modelName, fields);
        totalUpdated += count;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ MIGRAÇÃO CONCLUÍDA!`);
    console.log(`   Total de registros atualizados: ${totalUpdated}`);
    console.log('='.repeat(60));
}

main()
    .catch((e) => {
        console.error('\n❌ Erro fatal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
