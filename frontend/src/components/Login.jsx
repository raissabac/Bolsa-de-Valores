import { useState } from "react";
import { login } from "../services/api.js";

export default function Login({ onEntrar }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const sessao = await login(email.trim(), senha);

      if (!sessao.access_token || !sessao.investidor) {
        throw new Error("O serviço retornou uma sessão incompleta.");
      }

      onEntrar(sessao);
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login">
      <h1>Home Broker</h1>

      <form onSubmit={entrar}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
        />

        <button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        {erro && (
          <p className="erro" role="alert">
            {erro}
          </p>
        )}
      </form>
    </main>
  );
}