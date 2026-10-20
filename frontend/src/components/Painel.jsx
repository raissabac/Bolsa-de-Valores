import { useEffect, useState } from "react";
import { getAtivos, getCarteira } from "../services/api.js";
import FormularioOrdem from "./FormularioOrdem.jsx";

function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export default function Painel({ sessao, onSair }) {
  const [ativos, setAtivos] = useState([]);
  const [carteira, setCarteira] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [consulta, setConsulta] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const [listaAtivos, dadosCarteira] = await Promise.all([
          getAtivos(),
          getCarteira(sessao.access_token),
        ]);

        if (!cancelado) {
          setAtivos(listaAtivos);
          setCarteira(dadosCarteira);
        }
      } catch (error) {
        if (!cancelado) {
          setErro(error.message);
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      cancelado = true;
    };
  }, [sessao.access_token, consulta]);

  return (
    <main className="painel">
      <header className="cabecalho">
        <div>
          <h1>Home Broker</h1>
          <p>Investidor: {sessao.investidor.nome}</p>
        </div>

        <button type="button" onClick={onSair}>
          Sair
        </button>
      </header>

      <div className="acoes-painel">
        <button
          type="button"
          disabled={carregando}
          onClick={() => setConsulta((valor) => valor + 1)}
        >
          Atualizar dados
        </button>
      </div>

      {carregando && <p role="status">Carregando informações...</p>}

      {erro && (
        <p className="erro" role="alert">
          {erro} Tente novamente pelo botão Atualizar dados.
        </p>
      )}

      {!carregando && !erro && carteira && (
        <>
          <div className="resumo">
            <section className="card">
              <h2>Saldo disponível</h2>
              <p className="valor">{moeda(carteira.saldo_disponivel)}</p>
            </section>

            <section className="card">
              <h2>Patrimônio total</h2>
              <p className="valor">{moeda(carteira.patrimonio)}</p>
            </section>
          </div>

          <section className="card">
            <h2>Ativos negociáveis</h2>

            {ativos.length === 0 ? (
              <p>Nenhum ativo disponível.</p>
            ) : (
              <div className="tabela">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Empresa</th>
                      <th scope="col">Preço de referência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ativos.map((ativo) => (
                      <tr key={ativo.codigo}>
                        <td>{ativo.codigo}</td>
                        <td>{ativo.nome}</td>
                        <td>{moeda(ativo.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h2>Minha carteira</h2>

            {carteira.posicoes.length === 0 ? (
              <p>Você ainda não possui ações.</p>
            ) : (
              <div className="tabela">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Ativo</th>
                      <th scope="col">Empresa</th>
                      <th scope="col">Quantidade</th>
                      <th scope="col">Disponível para venda</th>
                      <th scope="col">Preço médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carteira.posicoes.map((posicao) => (
                      <tr key={posicao.ativo_codigo}>
                        <td>{posicao.ativo_codigo}</td>
                        <td>{posicao.ativo_nome}</td>
                        <td>{posicao.quantidade}</td>
                        <td>{posicao.quantidade - (posicao.quantidade_reservada || 0)}</td>
                        <td>{moeda(posicao.preco_medio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {carteira && (
        <FormularioOrdem
          ativos={ativos}
          token={sessao.access_token}
          atualizando={carregando}
          onRegistrada={() => setConsulta((valor) => valor + 1)}
        />
      )}
    </main>
  );
}