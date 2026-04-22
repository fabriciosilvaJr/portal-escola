#!/usr/bin/env node

const { Pool } = require('pg');
const { fakerPT_BR: faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (key && value) {
      const cleanKey = key.replace(/^--/, '');
      params[cleanKey] = value;
    }
  });
  
  return params;
}

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portal_escolar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Disciplinas
const disciplinas = [
  'portugues', 'matematica', 'historia', 'geografia', 'biologia',
  'fisica', 'quimica', 'filosofia', 'sociologia', 'educacao_fisica',
  'arte', 'ingles'
];

// Helper para criar slug do nome
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');
}

// Função principal
async function seed() {
  try {
    console.log('🌱 === SEEDER - Portal Escolar ===\n');

    const args = parseArgs();
    const anoInicio = parseInt(args['ano-inicio']);
    const anoFim = parseInt(args['ano-fim']);
    const seedValue = parseInt(args['seed'] || '42');

    if (!anoInicio || !anoFim) {
      console.error('❌ Erro: Parâmetros obrigatórios não fornecidos');
      console.log('\nUso: npm run seed -- --ano-inicio=YYYY --ano-fim=YYYY [--seed=42]');
      console.log('\nExemplo: npm run seed -- --ano-inicio=2023 --ano-fim=2025');
      process.exit(1);
    }

    if (anoFim < anoInicio) {
      console.error('❌ Erro: ano-fim deve ser maior ou igual a ano-inicio');
      process.exit(1);
    }

    console.log(`📅 Intervalo de anos: ${anoInicio} - ${anoFim}`);
    console.log(`🎲 Seed: ${seedValue}`);
    console.log(`👥 Alunos a gerar: 100\n`);

    // Conectar ao banco
    console.log('📡 Conectando ao banco de dados...');
    await pool.connect();
    console.log('✅ Conectado!\n');

    // Configurar faker com seed
    faker.seed(seedValue);

    // Senha padrão (hash de "123456")
    const senhaPadrao = '$2a$10$pgdL4ZCzsIX2AMHwxuTs9eE5kpWKsREYbfaKs4CNMz.qgO0yhs.uW';

    // Gerar 100 alunos
    console.log('👤 Gerando alunos...');
    const alunos = [];
    for (let i = 1; i <= 100; i++) {
      const nome = faker.person.fullName();
      const matricula = `${anoInicio}${String(i).padStart(3, '0')}`;
      const email = `${slugify(nome)}.${matricula}@seed.escola.com`;
      
      alunos.push({
        matricula,
        nome,
        email,
        senha: senhaPadrao
      });
    }
    console.log(`✅ ${alunos.length} alunos gerados em memória\n`);

    // Inserir alunos no banco
    console.log('💾 Inserindo alunos no banco de dados...');
    let inseridos = 0;
    let ignorados = 0;

    for (const aluno of alunos) {
      try {
        const result = await pool.query(
          `INSERT INTO usuarios (matricula, nome, email, senha, tipo_usuario)
           VALUES ($1, $2, $3, $4, 'aluno')
           ON CONFLICT (matricula) DO NOTHING
           RETURNING id`,
          [aluno.matricula, aluno.nome, aluno.email, aluno.senha]
        );
        
        if (result.rows.length > 0) {
          inseridos++;
        } else {
          ignorados++;
        }
      } catch (error) {
        if (error.constraint === 'usuarios_email_key') {
          ignorados++;
        } else {
          throw error;
        }
      }
    }
    
    console.log(`✅ ${inseridos} alunos inseridos`);
    console.log(`⏭️  ${ignorados} alunos ignorados (já existiam)\n`);

    // Gerar notas para CSV
    console.log('📊 Gerando notas...');
    const linhasNotas = [];
    
    for (const aluno of alunos) {
      for (let ano = anoInicio; ano <= anoFim; ano++) {
        const linha = {
          matricula: aluno.matricula,
          ano: ano
        };
        
        disciplinas.forEach(disc => {
          linha[disc] = faker.number.float({ min: 0, max: 10, fractionDigits: 1 });
        });
        
        linhasNotas.push(linha);
      }
    }
    
    console.log(`✅ ${linhasNotas.length} registros de notas gerados\n`);

    // Ordenar por ano e matrícula
    linhasNotas.sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.matricula.localeCompare(b.matricula);
    });

    // Escrever CSV
    console.log('📝 Gerando CSV...');
    const csvPath = path.join(__dirname, '..', 'seed-notas.csv');
    
    const header = ['matricula', 'ano', ...disciplinas].join(',');
    const rows = linhasNotas.map(linha => {
      return [
        linha.matricula,
        linha.ano,
        ...disciplinas.map(disc => linha[disc])
      ].join(',');
    });
    
    const csvContent = [header, ...rows].join('\n');
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    
    console.log(`✅ CSV gerado: ${csvPath}\n`);

    console.log('🎉 === SEEDER CONCLUÍDO COM SUCESSO ===');
    console.log(`\n📋 Resumo:`);
    console.log(`   - ${alunos.length} alunos (${inseridos} inseridos, ${ignorados} já existiam)`);
    console.log(`   - ${linhasNotas.length} registros de notas no CSV`);
    console.log(`   - Anos: ${anoInicio} a ${anoFim}`);
    console.log(`\n💡 Próximo passo: Importar o CSV pela UI do admin em http://localhost:4200`);

  } catch (error) {
    console.error('\n❌ Erro ao executar seeder:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o PostgreSQL está rodando.');
      console.log('Para iniciar com Docker: npm run db:up');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar seeder
seed().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
