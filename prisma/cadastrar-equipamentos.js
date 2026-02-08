const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Equipamentos extraídos da imagem
const equipamentos = [
    { codigo: "ABM.001", descricao: "AQUECIMENTO ALFATEC (REFEITORIO)" },
    { codigo: "ALB.001", descricao: "ALIM. Nº24 TOP (TORNEARIA)" },
    { codigo: "ALB.002", descricao: "ALIM. Nº25-IEMCA(TORNEARIA)" },
    { codigo: "ALB.003", descricao: "ALIM. Nº26-IEMCA (TORNEARIA)" },
    { codigo: "ALB.004", descricao: "ALIM. Nº27-IEMCA(TORNEARIA)" },
    { codigo: "ALB.005", descricao: "ALIM. Nº28-IEMCA(TORNEARIA)" },
    { codigo: "ALB.008", descricao: "ALIM. Nº31-IEMCA(TORNEARIA)" },
    { codigo: "ALB.009", descricao: "ALIM. Nº32-AKUFEED(TORNEARIA)" },
    { codigo: "ALB.010", descricao: "ALIM. Nº33-AKUFEED(TORNEARIA)" },
    { codigo: "ALB.011", descricao: "ALIM. Nº34-AKUFEED(TORNEARIA)" },
    { codigo: "ALB.012", descricao: "ALIM. Nº35-AKUFEED(TORNEARIA)" },
    { codigo: "ALB.013", descricao: "ALIM. Nº29-IEMCA(TORNEARIA)" },
    { codigo: "ALB.014", descricao: "ALIM. Nº30-IEMCA(TORNEARIA)" },
    { codigo: "ALB.015", descricao: "ALIM. Nº23-IEMCA(TORNEARIA)" },
    { codigo: "ALB.016", descricao: "ALIM. Nº03-MAROMATIC(CAD. LATAO)" },
    { codigo: "ALB.017", descricao: "ALIM. Nº06-MAROMATIC(CAD. LATAO)" },
    { codigo: "ALB.018", descricao: "ALIM. Nº09-MAROMATIC(CAD. LATAO)" },
    { codigo: "ALB.019", descricao: "ALIM. DE CAIXAS COMBAT (GALVA)" },
    { codigo: "ALC.001", descricao: "ALIM. ELET. SETREMA Nº4 (ZANI Nº02)" },
    { codigo: "ALC.002", descricao: "ALIM. ELET. SETREMA Nº3 (PRENSA SEY)" },
    { codigo: "ALC.003", descricao: "ALIM. ELET. PA Nº01 (GUTMANN Nº19)" },
    { codigo: "ALC.004", descricao: "ALIM. ELET. PA Nº02 (GUTMANN Nº10)" },
    { codigo: "ALC.005", descricao: "ALIM. ELET. SETREMA Nº5 (ZANI Nº 1)" },
    { codigo: "ALC.006", descricao: "ALIM. ELET. SETREMA Nº6 (ZANI Nº 08)" },
    { codigo: "ALC.007", descricao: "ALIM. ELET. SETREMA Nº7 (ZANI Nº 6)" },
    { codigo: "ALC.008", descricao: "ALIM. ELET. SETREMA Nº8 (ZANI Nº 03)" },
    { codigo: "ALC.009", descricao: "ALIM. ELET. SETREMA Nº9 (ZANI Nº 5)" },
    { codigo: "ALC.010", descricao: "ALIM. ELET. SETREMA Nº10 (JUNDIAI Nº18)" },
    { codigo: "ALC.011", descricao: "ALIM. ELET. SETREMA Nº11 (ZANI Nº09)" },
    { codigo: "ALC.012", descricao: "ALIM. ELET. SETREMA Nº12 (JUNDIA Nº10)" },
    { codigo: "ALC.013", descricao: "ALIM. ELET. SETREMA Nº13 (AGOST. Nº16)" },
    { codigo: "ALC.014", descricao: "ALIM. ELET. SETREMA Nº14 (AGOST. Nº17)" },
    { codigo: "ARC.001", descricao: "AR SPLIT Nº1(FIOS)" },
    { codigo: "ARC.002", descricao: "AR SPLIT Nº2(FIOS)" }
];

async function cadastrarEquipamentos() {
    console.log('Iniciando cadastro de equipamentos...\n');

    let criados = 0;
    let existentes = 0;
    let erros = 0;

    for (const equip of equipamentos) {
        try {
            // Verificar se já existe
            const existente = await prisma.bem.findFirst({
                where: { codigo: equip.codigo }
            });

            if (existente) {
                console.log(`⚠️  ${equip.codigo} - Já existe`);
                existentes++;
                continue;
            }

            // Criar novo equipamento
            await prisma.bem.create({
                data: {
                    codigo: equip.codigo.toUpperCase(),
                    descricao: equip.descricao.toUpperCase(),
                    centroCusto: "319", // Centro de custo padrão
                    estacao: "",
                    localizacao: ""
                }
            });

            console.log(`✅ ${equip.codigo} - Cadastrado com sucesso`);
            criados++;
        } catch (error) {
            console.error(`❌ ${equip.codigo} - Erro: ${error.message}`);
            erros++;
        }
    }

    console.log('\n========================================');
    console.log(`Total de equipamentos: ${equipamentos.length}`);
    console.log(`Criados: ${criados}`);
    console.log(`Já existentes: ${existentes}`);
    console.log(`Erros: ${erros}`);
    console.log('========================================');
}

cadastrarEquipamentos()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
