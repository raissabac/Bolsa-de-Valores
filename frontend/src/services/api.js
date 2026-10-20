import { ativosMock, carteiraMock, investidorMock } from "./mockData.js";

export const modoSimulado = import.meta.env.VITE_USE_MOCK !== "false";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const MOCK_TOKEN = "mock-token-lula-silva";
let carteiraAtual = structuredClone(carteiraMock);
let proximaOrdem = 1;
const USE_MOCK = true;
const centavos = (valor) => Math.round(valor * 100);
const simularAtraso = () => new Promise((resolve) => setTimeout(resolve, 300));

async function requisicao(path, { token, ...options } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    if (path === "/ordens" && options.method === "POST") throw new Error("Não foi possível confirmar o envio. Confira no servidor se a ordem foi registrada antes de reenviar.");
    throw new Error("Não foi possível acessar o servidor. Confira a conexão e tente novamente.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detalhe = data?.detail || data?.message;
    const erro = new Error(typeof detalhe === "string" ? detalhe : `Requisição rejeitada (${response.status}).`);
    erro.status = response.status;
    throw erro;
  }
  if (data === null) throw new Error("O servidor retornou uma resposta sem dados válidos.");
  return data;
}

function validarToken(token) {
  if (token !== MOCK_TOKEN) throw new Error("Entre novamente para continuar.");
}

export async function login(email, senha) {
  if (!modoSimulado) {
    return requisicao("/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) });
  }
  await simularAtraso();
  if (email !== investidorMock.email || !senha) throw new Error("E-mail ou senha inválidos.");

  carteiraAtual = structuredClone(carteiraMock);
  proximaOrdem = 1;
  return { access_token: MOCK_TOKEN, token_type: "bearer", investidor: investidorMock };
}

export async function getAtivos() {
  if (!modoSimulado) return requisicao("/ativos");
  await simularAtraso();
  return structuredClone(ativosMock);
}

export async function getCarteira(token) {
  if (!modoSimulado) return requisicao("/carteira", { token });
  await simularAtraso();
  validarToken(token);
  return structuredClone(carteiraAtual);
}

export async function enviarOrdem(
  token,
  { ativo_codigo, tipo_operacao, quantidade, preco_limite },
) {
  if (USE_MOCK) {
    await simularAtraso();

    if (token !== MOCK_TOKEN) {
      throw new Error("Sessão inválida.");
    }

    if (!ativosMock.some((ativo) => ativo.codigo === ativo_codigo)) {
      throw new Error("Ativo inválido.");
    }

    if (!["compra", "venda"].includes(tipo_operacao)) {
      throw new Error("Operação inválida.");
    }

    if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
      throw new Error("Informe uma quantidade inteira positiva.");
    }

    const precoCentavos = Math.round(preco_limite * 100);

    if (
      !Number.isFinite(preco_limite) ||
      precoCentavos <= 0 ||
      Math.abs(preco_limite * 100 - precoCentavos) > 0.000001
    ) {
      throw new Error("Informe um preço positivo com até duas casas decimais.");
    }

    const totalCentavos = quantidade * precoCentavos;

    if (!Number.isSafeInteger(totalCentavos)) {
      throw new Error("O valor da ordem é muito alto.");
    }

    if (tipo_operacao === "compra") {
      const saldoCentavos = Math.round(
        carteiraAtual.saldo_disponivel * 100,
      );

      if (totalCentavos > saldoCentavos) {
        throw new Error("Saldo insuficiente.");
      }

      carteiraAtual.saldo_disponivel =
        (saldoCentavos - totalCentavos) / 100;
    } else {
      const posicao = carteiraAtual.posicoes.find(
        (item) => item.ativo_codigo === ativo_codigo,
      );

      const disponivel = posicao
        ? posicao.quantidade - (posicao.quantidade_reservada || 0)
        : 0;

      if (quantidade > disponivel) {
        throw new Error("Quantidade de ações disponíveis insuficiente.");
      }

      posicao.quantidade_reservada =
        (posicao.quantidade_reservada || 0) + quantidade;
    }

    return {
      id: proximaOrdem++,
      ativo_codigo,
      tipo_operacao,
      quantidade,
      preco_limite,
      status: "registrada",
    };
  }

  return requisicao("/ordens", {
    method: "POST",
    token,
    body: JSON.stringify({
      ativo_codigo,
      tipo_operacao,
      quantidade,
      preco_limite,
    }),
  });
}