export const investidorMock = {
  id: 1,
  nome: "Lula Silva",
  email: "lula@email.com",
};

export const ativosMock = [
  { codigo: "ORAT", nome: "Orama Tecnologia", preco: 25.0 },
  { codigo: "BAC", nome: "Bacar Business", preco: 20.0 },
  { codigo: "AMAR(o)", nome: "Amar(o) Systems", preco: 28.0 },
];

export const carteiraMock = {
  saldo_disponivel: 10000.0,
  patrimonio: 10250.0,
  posicoes: [
    {
      ativo_codigo: "ORAT",
      ativo_nome: "Orama Tecnologia",
      quantidade: 10,
      preco_medio: 25.0,
    },
  ],
};