const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Iniciando seed do módulo de Manutenção...\n');

    // Criar Motivos de Pausa
    console.log('📋 Criando motivos de pausa...');
    const motivosPausa = [
        { codigo: 'MP01', descricao: 'Aguardando Peça' },
        { codigo: 'MP02', descricao: 'Aguardando Janela de Parada' },
        { codigo: 'MP03', descricao: 'Aguardando Terceiro' },
        { codigo: 'MP04', descricao: 'Questão de Segurança' },
        { codigo: 'MP05', descricao: 'Aguardando Ferramenta' },
        { codigo: 'MP06', descricao: 'Intervalo/Refeição' },
        { codigo: 'MP07', descricao: 'Outro' },
    ];

    for (const motivo of motivosPausa) {
        await prisma.motivoPausa.upsert({
            where: { codigo: motivo.codigo },
            update: {},
            create: motivo,
        });
    }
    console.log('   ✅ Motivos de pausa criados\n');

    // Criar Problemas
    console.log('❌ Criando lista de problemas...');
    const problemas = [
        { codigo: 'P01', descricao: 'Falha Elétrica' },
        { codigo: 'P02', descricao: 'Falha Mecânica' },
        { codigo: 'P03', descricao: 'Desgaste Natural' },
        { codigo: 'P04', descricao: 'Mau Funcionamento' },
        { codigo: 'P05', descricao: 'Ruído Anormal' },
        { codigo: 'P06', descricao: 'Vazamento' },
        { codigo: 'P07', descricao: 'Superaquecimento' },
        { codigo: 'P08', descricao: 'Travamento' },
        { codigo: 'P09', descricao: 'Erro no Sistema' },
        { codigo: 'P10', descricao: 'Outros' },
    ];

    for (const prob of problemas) {
        await prisma.problemaOS.upsert({
            where: { codigo: prob.codigo },
            update: {},
            create: prob,
        });
    }
    console.log('   ✅ Problemas criados\n');

    // Criar Causas
    console.log('🔍 Criando lista de causas...');
    const causas = [
        { codigo: 'C01', descricao: 'Desgaste de Componente' },
        { codigo: 'C02', descricao: 'Falta de Lubrificação' },
        { codigo: 'C03', descricao: 'Sobrecarga' },
        { codigo: 'C04', descricao: 'Curto Circuito' },
        { codigo: 'C05', descricao: 'Mau Uso' },
        { codigo: 'C06', descricao: 'Falta de Manutenção Preventiva' },
        { codigo: 'C07', descricao: 'Falha de Material' },
        { codigo: 'C08', descricao: 'Vibração Excessiva' },
        { codigo: 'C09', descricao: 'Contaminação' },
        { codigo: 'C10', descricao: 'Outros' },
    ];

    for (const causa of causas) {
        await prisma.causaOS.upsert({
            where: { codigo: causa.codigo },
            update: {},
            create: causa,
        });
    }
    console.log('   ✅ Causas criadas\n');

    // Criar Soluções
    console.log('✅ Criando lista de soluções...');
    const solucoes = [
        { codigo: 'S01', descricao: 'Substituição de Peça' },
        { codigo: 'S02', descricao: 'Reparo no Local' },
        { codigo: 'S03', descricao: 'Ajuste/Regulagem' },
        { codigo: 'S04', descricao: 'Lubrificação' },
        { codigo: 'S05', descricao: 'Limpeza' },
        { codigo: 'S06', descricao: 'Troca de Componente Elétrico' },
        { codigo: 'S07', descricao: 'Reset/Reinicialização' },
        { codigo: 'S08', descricao: 'Alinhamento' },
        { codigo: 'S09', descricao: 'Calibração' },
        { codigo: 'S10', descricao: 'Outros' },
    ];

    for (const sol of solucoes) {
        await prisma.solucaoOS.upsert({
            where: { codigo: sol.codigo },
            update: {},
            create: sol,
        });
    }
    console.log('   ✅ Soluções criadas\n');

    // Criar Técnicos de exemplo
    console.log('👷 Criando técnicos de exemplo...');
    const tecnicos = [
        { matricula: '10001', nome: 'João Silva', especialidade: 'Elétrica', telefone: '(11) 99999-0001' },
        { matricula: '10002', nome: 'Carlos Santos', especialidade: 'Mecânica', telefone: '(11) 99999-0002' },
        { matricula: '10003', nome: 'Pedro Oliveira', especialidade: 'Geral', telefone: '(11) 99999-0003' },
        { matricula: '10004', nome: 'Marcos Ferreira', especialidade: 'Elétrica', telefone: '(11) 99999-0004' },
        { matricula: '10005', nome: 'Lucas Souza', especialidade: 'Mecânica', telefone: '(11) 99999-0005' },
    ];

    for (const tec of tecnicos) {
        await prisma.tecnico.upsert({
            where: { matricula: tec.matricula },
            update: {},
            create: tec,
        });
    }
    console.log('   ✅ Técnicos criados\n');

    // Criar Bens/Máquinas de exemplo
    console.log('🏭 Criando bens/máquinas de exemplo...');
    const bens = [
        { codigo: 'MAQ-001', descricao: 'Prensa Hidráulica 01', centroCusto: '314111', estacao: 'Linha A', localizacao: 'Galpão 1' },
        { codigo: 'MAQ-002', descricao: 'Torno CNC 01', centroCusto: '314111', estacao: 'Linha A', localizacao: 'Galpão 1' },
        { codigo: 'MAQ-003', descricao: 'Fresadora Universal', centroCusto: '315111', estacao: 'Linha B', localizacao: 'Galpão 2' },
        { codigo: 'MAQ-004', descricao: 'Centro de Usinagem', centroCusto: '315111', estacao: 'Linha B', localizacao: 'Galpão 2' },
        { codigo: 'MAQ-005', descricao: 'Retífica Cilíndrica', centroCusto: '316111', estacao: 'Linha C', localizacao: 'Galpão 3' },
        { codigo: 'MAQ-006', descricao: 'Furadeira Radial', centroCusto: '316111', estacao: 'Linha C', localizacao: 'Galpão 3' },
        { codigo: 'MAQ-007', descricao: 'Solda MIG/MAG 01', centroCusto: '317111', estacao: 'Box 1', localizacao: 'Soldagem' },
        { codigo: 'MAQ-008', descricao: 'Compressor de Ar', centroCusto: '317111', estacao: 'Utilidades', localizacao: 'Casa de Máquinas' },
        { codigo: 'MAQ-009', descricao: 'Ponte Rolante 10T', centroCusto: '313111', estacao: 'Geral', localizacao: 'Galpão Principal' },
        { codigo: 'MAQ-010', descricao: 'Empilhadeira Elétrica', centroCusto: '313111', estacao: 'Logística', localizacao: 'Expedição' },
    ];

    for (const bem of bens) {
        await prisma.bem.upsert({
            where: { codigo: bem.codigo },
            update: {},
            create: { ...bem, qrCode: bem.codigo },
        });
    }
    console.log('   ✅ Bens/Máquinas criados\n');

    console.log('🎉 Seed de Manutenção concluído com sucesso!');
    console.log('\n📌 Resumo:');
    console.log(`   - ${motivosPausa.length} motivos de pausa`);
    console.log(`   - ${problemas.length} problemas`);
    console.log(`   - ${causas.length} causas`);
    console.log(`   - ${solucoes.length} soluções`);
    console.log(`   - ${tecnicos.length} técnicos`);
    console.log(`   - ${bens.length} bens/máquinas`);
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
