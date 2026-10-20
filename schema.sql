-- Schema inicial do Simulador de Bolsa de Valores Distribuído
-- Compatível com PostgreSQL 15.

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    token_sessao VARCHAR(255) NOT NULL UNIQUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ativos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nome_empresa VARCHAR(100) NOT NULL,
    preco_inicial DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS carteiras (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    saldo_disponivel DECIMAL(12, 2) NOT NULL DEFAULT 10000.00
);

CREATE TABLE IF NOT EXISTS posicoes (
    id SERIAL PRIMARY KEY,
    carteira_id INT NOT NULL REFERENCES carteiras(id),
    ativo_id INT NOT NULL REFERENCES ativos(id),
    quantidade INT NOT NULL DEFAULT 0,
    preco_medio DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ordens (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id),
    ativo_id INT NOT NULL REFERENCES ativos(id),
    tipo_operacao VARCHAR(10) NOT NULL,
    quantidade INT NOT NULL,
    preco_limite DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTRADA',
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Senhas das contas locais de demonstração armazenadas com PBKDF2-SHA256.
INSERT INTO usuarios (nome, email, senha_hash) VALUES
    ('Ana Silva', 'ana@email.com', 'pbkdf2_sha256$600000$a345f3228055761cdc7385d95459b062$67e5be9fd067814830a32354908fa8edcf043bb3c1b91e95fd63d8b2b933a783'),
    ('Bruno Santos', 'bruno@email.com', 'pbkdf2_sha256$600000$729cd5475e6196caad10b5bd139c5b71$50617b20f7db9d6a2c15e1f1c54a3e434b3e30c145dc16ade2ff04da43239f71')
ON CONFLICT (email) DO NOTHING;

INSERT INTO ativos (codigo, nome_empresa, preco_inicial) VALUES
    ('ORAT', 'Orama Tecnologia', 25.00),
    ('BAC', 'Bacar Business', 20.00),
    ('LISB', 'Lisboa Systems', 28.00)
ON CONFLICT (codigo) DO NOTHING;

-- As carteiras são vinculadas aos usuários pelo e-mail para evitar dependência
-- de IDs fixos caso o banco já contenha registros.
INSERT INTO carteiras (usuario_id, saldo_disponivel)
SELECT u.id, 10000.00
FROM usuarios AS u
WHERE u.email IN ('ana@email.com', 'bruno@email.com')
  AND NOT EXISTS (
      SELECT 1 FROM carteiras AS c WHERE c.usuario_id = u.id
  );

-- Posição inicial de demonstração da Ana: 10 ações ORAT a R$ 25,00.
INSERT INTO posicoes (carteira_id, ativo_id, quantidade, preco_medio)
SELECT c.id, a.id, 10, 25.00
FROM carteiras AS c
JOIN usuarios AS u ON u.id = c.usuario_id
JOIN ativos AS a ON a.codigo = 'ORAT'
WHERE u.email = 'ana@email.com'
  AND NOT EXISTS (
      SELECT 1
      FROM posicoes AS p
      WHERE p.carteira_id = c.id
        AND p.ativo_id = a.id
  );
