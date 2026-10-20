-- Atualiza as contas locais de demonstração e cria a posição inicial da Ana.
-- Seguro para executar mais de uma vez: a posição só é inserida se ainda não existir.
BEGIN;

UPDATE usuarios
SET senha_hash = 'pbkdf2_sha256$600000$a345f3228055761cdc7385d95459b062$67e5be9fd067814830a32354908fa8edcf043bb3c1b91e95fd63d8b2b933a783'
WHERE email = 'ana@email.com';

UPDATE usuarios
SET senha_hash = 'pbkdf2_sha256$600000$729cd5475e6196caad10b5bd139c5b71$50617b20f7db9d6a2c15e1f1c54a3e434b3e30c145dc16ade2ff04da43239f71'
WHERE email = 'bruno@email.com';

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

COMMIT;
