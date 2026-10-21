import { useEffect, useState } from "react";
import { getOrdensAbertas, modoSimulado } from "../services/api.js";
import { conectarMercado } from "../services/websocket.js";

function moeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export default function AtividadeMercado() {
  const [estado, setEstado] = useState("Conectando...");
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    // Busca o livro de ofertas atual (ordens abertas antes de conectar)
    getOrdensAbertas()
      .then((abertas) => {
        if (abertas.length > 0) {
          setEventos(abertas.slice(0, 20));
        }
      })
      .catch(() => {
        // Falha silenciosa: o WebSocket ainda traz atualizações em tempo real
      });

    if (modoSimulado) return;

    let encerrado = false;
    let conexao;
    let tentativa;

    function conectar() {
      setEstado("Conectando...");

      conexao = conectarMercado();

      conexao.onopen = () => {
        if (encerrado) return;

        setEstado("Conectado");
        setErro("");
      };

      conexao.onmessage = (event) => {
        if (encerrado) return;

        try {
          const mensagem = JSON.parse(event.data);

          if (mensagem.evento !== "NOVA_ORDEM") {
            return;
          }

          const ordem = mensagem.dados;

          if (!ordem || ordem.ordem_id == null) {
            throw new Error("Evento sem identificação da ordem.");
          }

          setEventos((anteriores) => [
            ordem,
            ...anteriores.filter(
              (item) => item.ordem_id !== ordem.ordem_id,
            ),
          ].slice(0, 20));
        } catch {
          setErro("Não foi possível interpretar uma atualização do mercado.");
        }
      };

      conexao.onerror = () => {
        if (!encerrado) {
          setEstado("Falha na conexão");
        }
      };

      conexao.onclose = () => {
        if (encerrado) return;

        setEstado("Desconectado. Tentando reconectar...");
        tentativa = setTimeout(conectar, 3000);
      };
    }

    conectar();

    return () => {
      encerrado = true;
      clearTimeout(tentativa);
      conexao?.close();
    };
  }, []);

  return (
    <section className="card">
      <h2>Atividade do mercado</h2>

      <p role="status">
        {modoSimulado
          ? "Eventos em tempo real disponíveis somente com a API real."
          : `Conexão: ${estado}`}
      </p>

      {erro && (
        <p className="erro" role="alert">
          {erro}
        </p>
      )}

      <p>
        Ordens abertas no momento do acesso e novas ordens em tempo real.
        Os eventos não representam negociações executadas.
      </p>

      {eventos.length === 0 ? (
        <p>Nenhum evento recebido nesta sessão.</p>
      ) : (
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th scope="col">Ordem</th>
                <th scope="col">Ativo</th>
                <th scope="col">Operação</th>
                <th scope="col">Quantidade</th>
                <th scope="col">Preço limite</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>

            <tbody>
              {eventos.map((ordem) => (
                <tr key={ordem.ordem_id}>
                  <td>{ordem.ordem_id}</td>
                  <td>{ordem.ativo_codigo}</td>
                  <td>
                    {ordem.tipo_operacao === "COMPRA"
                      ? "Compra"
                      : "Venda"}
                  </td>
                  <td>{ordem.quantidade}</td>
                  <td>{moeda(ordem.preco_limite)}</td>
                  <td>{ordem.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}