#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Configuração do banco
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'portal_escolar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Interface para entrada de dados
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function pergunta(questao) {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => {
      resolve(resposta.trim());
    });
  });
}

// Função para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para validar matrícula (formato: 4 dígitos + 3 dígitos)
function validarMatricula(matricula) {
  const regex = /^\d{7}$/;
  return regex.test(matricula);
}

// Função principal
async function cadastrarAluno() {
  try {
    console.log('🎓 === CADASTRO DE NOVO ALUNO ===\n');

    // Conectar ao banco
    console.log('📡 Conectando ao banco de dados...');
    await pool.connect();
    console.log('✅ Conectado com sucesso!\n');

    let matricula, nome, email, senha;

    // Coletar matrícula
    while (true) {
      matricula = await pergunta('📝 Digite a matrícula do aluno (7 dígitos): ');
      
      if (!validarMatricula(matricula)) {
        console.log('❌ Matrícula inválida! Deve conter exatamente 7 dígitos.\n');
        continue;
      }

      // Verificar se matrícula já existe
      const matriculaExiste = await pool.query(
        'SELECT id FROM usuarios WHERE matricula = $1',
        [matricula]
      );

      if (matriculaExiste.rows.length > 0) {
        console.log('❌ Esta matrícula já está cadastrada!\n');
        continue;
      }

      break;
    }

    // Coletar nome
    while (true) {
      nome = await pergunta('👤 Digite o nome completo do aluno: ');
      
      if (nome.length < 2) {
        console.log('❌ Nome deve ter pelo menos 2 caracteres.\n');
        continue;
      }

      break;
    }

    // Coletar email
    while (true) {
      email = await pergunta('📧 Digite o email do aluno: ');
      
      if (!validarEmail(email)) {
        console.log('❌ Email inválido!\n');
        continue;
      }

      // Verificar se email já existe
      const emailExiste = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (emailExiste.rows.length > 0) {
        console.log('❌ Este email já está cadastrado!\n');
        continue;
      }

      break;
    }

    // Coletar senha
    while (true) {
      senha = await pergunta('🔒 Digite a senha do aluno (mínimo 6 caracteres): ');
      
      if (senha.length < 6) {
        console.log('❌ Senha deve ter pelo menos 6 caracteres.\n');
        continue;
      }

      const confirmarSenha = await pergunta('🔒 Confirme a senha: ');
      
      if (senha !== confirmarSenha) {
        console.log('❌ Senhas não coincidem!\n');
        continue;
      }

      break;
    }

    // Confirmar dados
    console.log('\n📋 === DADOS DO ALUNO ===');
    console.log(`Matrícula: ${matricula}`);
    console.log(`Nome: ${nome}`);
    console.log(`Email: ${email}`);
    console.log(`Senha: ${'*'.repeat(senha.length)}`);

    const confirmar = await pergunta('\n✅ Confirma o cadastro? (s/n): ');
    
    if (confirmar.toLowerCase() !== 's' && confirmar.toLowerCase() !== 'sim') {
      console.log('❌ Cadastro cancelado.');
      return;
    }

    // Criptografar senha
    console.log('\n🔐 Criptografando senha...');
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Inserir no banco
    console.log('💾 Salvando no banco de dados...');
    const resultado = await pool.query(
      `INSERT INTO usuarios (matricula, nome, email, senha, tipo_usuario) 
       VALUES ($1, $2, $3, $4, 'aluno') 
       RETURNING id, matricula, nome, email, created_at`,
      [matricula, nome, email, senhaCriptografada]
    );

    const alunoInserido = resultado.rows[0];

    console.log('\n🎉 === ALUNO CADASTRADO COM SUCESSO! ===');
    console.log(`ID: ${alunoInserido.id}`);
    console.log(`Matrícula: ${alunoInserido.matricula}`);
    console.log(`Nome: ${alunoInserido.nome}`);
    console.log(`Email: ${alunoInserido.email}`);
    console.log(`Cadastrado em: ${new Date(alunoInserido.created_at).toLocaleString('pt-BR')}`);
    console.log('\n✅ O aluno já pode fazer login no sistema!');

  } catch (error) {
    console.error('\n❌ Erro ao cadastrar aluno:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Verifique se o PostgreSQL está rodando.');
      console.log('Para iniciar com Docker: docker-compose up -d');
    }
  } finally {
    await pool.end();
    rl.close();
  }
}

// Executar script
cadastrarAluno().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});