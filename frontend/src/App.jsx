import { useState } from "react";
import Login from "./components/Login.jsx";
import "./style.css";

export default function App() {
  const [sessao, setSessao] = useState(null);

  if (!sessao) {
    return <Login onEntrar={setSessao} />;
  }

  return (
    <main className="login">
      <h1>Home Broker</h1>
      <p>Bem-vindo, {sessao.investidor.nome}.</p>
      <button type="button" onClick={() => setSessao(null)}>
        Sair
      </button>
    </main>
  );
}