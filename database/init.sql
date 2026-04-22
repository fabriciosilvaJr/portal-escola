
-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('admin', 'aluno')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notas dos alunos
CREATE TABLE notas_alunos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) NOT NULL,
    ano INTEGER NOT NULL,
    portugues DECIMAL(4,2),
    matematica DECIMAL(4,2),
    historia DECIMAL(4,2),
    geografia DECIMAL(4,2),
    biologia DECIMAL(4,2),
    fisica DECIMAL(4,2),
    quimica DECIMAL(4,2),
    filosofia DECIMAL(4,2),
    sociologia DECIMAL(4,2),
    educacao_fisica DECIMAL(4,2),
    arte DECIMAL(4,2),
    ingles DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(matricula, ano)
);

-- Índices para melhor performance
CREATE INDEX idx_notas_matricula ON notas_alunos(matricula);
CREATE INDEX idx_notas_ano ON notas_alunos(ano);
CREATE INDEX idx_usuarios_matricula ON usuarios(matricula);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (matricula, nome, email, senha, tipo_usuario) 
VALUES ('ADMIN001', 'Administrador', 'admin@escola.com', '$2a$10$Plx3qmqM5gSEoHnvFngESuqLbeMiBHB4D8bAn//62Jgn2OpHqakWS', 'admin');

-- Inserir alguns alunos de exemplo (senha: 123456)
INSERT INTO usuarios (matricula, nome, email, senha, tipo_usuario) VALUES 
('2024001', 'João Silva', 'joao@email.com', '$2a$10$pgdL4ZCzsIX2AMHwxuTs9eE5kpWKsREYbfaKs4CNMz.qgO0yhs.uW', 'aluno'),
('2024002', 'Maria Santos', 'maria@email.com', '$2a$10$pgdL4ZCzsIX2AMHwxuTs9eE5kpWKsREYbfaKs4CNMz.qgO0yhs.uW', 'aluno'),
('2024003', 'Pedro Oliveira', 'pedro@email.com', '$2a$10$pgdL4ZCzsIX2AMHwxuTs9eE5kpWKsREYbfaKs4CNMz.qgO0yhs.uW', 'aluno');

-- Inserir algumas notas de exemplo
-- INSERT INTO notas_alunos (matricula, ano, portugues, matematica, historia, geografia, biologia, fisica, quimica, filosofia, sociologia, educacao_fisica, arte, ingles) VALUES
-- ('2024001', 2024, 8.5, 7.2, 9.0, 8.8, 7.5, 6.8, 7.9, 8.2, 8.6, 9.5, 8.8, 7.6),
-- ('2024002', 2024, 9.2, 8.5, 8.7, 9.1, 8.9, 8.2, 8.8, 9.0, 8.4, 9.8, 9.3, 8.9),
-- ('2024003', 2024, 7.8, 6.9, 7.5, 7.2, 7.8, 7.1, 7.6, 7.9, 7.3, 8.5, 8.1, 7.4);