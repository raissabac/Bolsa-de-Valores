import { useState } from "react";
import Login from "./components/Login.jsx";
import Painel from "./components/Painel.jsx";
import "./style.css";

export default function App() {
  const [sessao, setSessao] = useState(null);

  if (!sessao) {
    return <Login onEntrar={setSessao} />;
  }

  return (
    <Painel
      sessao={sessao}
      onSair={() => setSessao(null)}
    />
  );
}