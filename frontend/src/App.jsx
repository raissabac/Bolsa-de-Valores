import { useState } from "react";
import Login from "./components/Login.jsx";
import Painel from "./components/Painel.jsx";
import { logout } from "./services/api.js";
import "./style.css";

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState("");

  async function sair() {
    if (saindo) return;

    setSaindo(true);
    setErroSaida("");

    try {
      await logout(sessao.access_token);
      setSessao(null);
    } catch (error) {
      if (error.status === 401) {
        setSessao(null);
      } else {
        setErroSaida(
          "Não foi possível confirmar o encerramento da sessão. Tente novamente.",
        );
      }
    } finally {
      setSaindo(false);
    }
  }

  if (!sessao) {
    return <Login onEntrar={setSessao} />;
  }

  return (
    <Painel
      sessao={sessao}
      onSair={sair}
      saindo={saindo}
      erroSaida={erroSaida}
    />
  );
}