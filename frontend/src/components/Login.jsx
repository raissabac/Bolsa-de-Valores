import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  function entrar(event) {
    event.preventDefault();
    setMensagem("Autenticação Pendente");
  }

  return (
    <main className="login">
      <h1>Home Broker - SD2026.2</h1>
      <p>Acesse sua conta para acompanhar o mercado.</p>

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

        <button type="submit">Entrar</button>

        {mensagem && <p role="status">{mensagem}</p>}
      </form>
    </main>
  );
}