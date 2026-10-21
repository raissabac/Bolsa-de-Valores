import { useState } from "react";
import { enviarOrdem } from "../services/api.js";

export default function FormularioOrdem({
  ativos,
  token,
  atualizando,
  onRegistrada,
}) {
  const [codigo, setCodigo] = useState("");
  const [operacao, setOperacao] = useState("compra");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  const ativoSelecionado = codigo || ativos[0]?.codigo || "";

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    setConfirmacao("");
    setEnviando(true);

    try {
      const ordem = await enviarOrdem(token, {
        ativo_codigo: ativoSelecionado,
        tipo_operacao: operacao,
        quantidade: Number(quantidade),
        preco_limite: Number(preco),
      });

      setConfirmacao(
        `Ordem ${ordem.id} recebida. Estado: ${ordem.status}.`,
      );
      setQuantidade("");
      setPreco("");
      onRegistrada(ordem);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card">
      <h2>Enviar ordem</h2>
      <p>
        Informe o preço máximo para comprar ou mínimo para vender.
      </p>

      <form onSubmit={enviar}>
        <label htmlFor="ativo">Ativo</label>
        <select
          id="ativo"
          required
          value={ativoSelecionado}
          onChange={(event) => setCodigo(event.target.value)}
        >
          {ativos.map((ativo) => (
            <option key={ativo.codigo} value={ativo.codigo}>
              {ativo.codigo} — {ativo.nome}
            </option>
          ))}
        </select>

        <label htmlFor="operacao">Operação</label>
        <select
          id="operacao"
          value={operacao}
          onChange={(event) => setOperacao(event.target.value)}
        >
          <option value="compra">Compra</option>
          <option value="venda">Venda</option>
        </select>

        <label htmlFor="quantidade">Quantidade</label>
        <input
          id="quantidade"
          type="number"
          min="1"
          step="1"
          required
          value={quantidade}
          onChange={(event) => setQuantidade(event.target.value)}
        />

        <label htmlFor="preco">Preço limite por ação (R$)</label>
        <input
          id="preco"
          type="number"
          min="0.01"
          step="0.01"
          required
          value={preco}
          onChange={(event) => setPreco(event.target.value)}
        />

        <button
          type="submit"
          disabled={enviando || atualizando || !ativoSelecionado}
        >
          {enviando ? "Enviando..." : "Enviar ordem"}
        </button>

        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}

        {confirmacao && (
          <p className="sucesso" role="status">
            {confirmacao}
          </p>
        )}
      </form>
    </section>
  );
}