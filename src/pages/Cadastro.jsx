import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postItem } from "../services/api";

export default function Cadastro() {
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [eventoSelecionado, setEventoSelecionado] = useState("");
  const [integrantes, setIntegrantes] = useState([""]);
  const [nomeSquad, setNomeSquad] = useState("");
  const [nivel, setNivel] = useState("");

  const navigate = useNavigate();

  // Verificação de usuários logados
  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) {
      alert("Você precisa estar logado para participar dos eventos.");
      navigate("/login");
    }
  }, []);

  const jogos = [
    "Valorant",
    "Rocket League",
    "League of Legends",
    "Fortnite",
    "Counter Strike 2",
  ];

  const eventosTeste = {
    "Valorant": [
      { id: 1, nome: "Spike Rush", dia: "Sábado", horario: "13:00 às 15:00" },
      { id: 2, nome: "Competitivo", dia: "Domingo", horario: "16:00 às 18:00" },
      { id: 3, nome: "Deathmatch", dia: "Sexta", horario: "20:00 às 22:00" },
    ],
    "Rocket League": [
      { id: 4, nome: "Duplas", dia: "Quarta", horario: "10:00 às 12:00" },
      { id: 5, nome: "Trio", dia: "Sábado", horario: "15:00 às 17:00" },
      { id: 6, nome: "1x1", dia: "Domingo", horario: "09:00 às 11:00" },
    ],
    "League of Legends": [
      { id: 7, nome: "5v5 Tradicional", dia: "Sábado", horario: "14:00 às 16:00" },
      { id: 8, nome: "ARAM", dia: "Domingo", horario: "17:00 às 19:00" },
      { id: 9, nome: "TFT", dia: "Segunda", horario: "20:00 às 22:00" },
    ],
    "Fortnite": [
      { id: 10, nome: "Solo", dia: "Sábado", horario: "12:00 às 14:00" },
      { id: 11, nome: "Duplas", dia: "Sábado", horario: "15:00 às 17:00" },
      { id: 12, nome: "Squad", dia: "Domingo", horario: "18:00 às 20:00" },
    ],
    "Counter Strike 2": [
      { id: 13, nome: "5v5 Competitivo", dia: "Sábado", horario: "13:00 às 15:00" },
      { id: 14, nome: "2v2 Wingman", dia: "Domingo", horario: "16:00 às 18:00" },
      { id: 15, nome: "Modo Casual", dia: "Sexta", horario: "19:00 às 21:00" },
    ],
  };

  const eventosFiltrados = jogoSelecionado ? eventosTeste[jogoSelecionado] : [];

  const handleIntegranteChange = (index, value) => {
    const novaLista = [...integrantes];
    novaLista[index] = value;
    setIntegrantes(novaLista);
  };

  const adicionarIntegrante = () => {
    setIntegrantes([...integrantes, ""]);
  };

  const removerIntegrante = (index) => {
    const novaLista = [...integrantes];
    novaLista.splice(index, 1);
    setIntegrantes(novaLista);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nomeSquad || !nivel || !jogoSelecionado || !eventoSelecionado || integrantes.some((nome) => nome === "")) {
      alert("Preencha todos os campos antes de cadastrar.");
      return;
    }

    const dadosCadastro = {
      nomeSquad,
      integrantes,
      jogo: jogoSelecionado,
      eventoId: parseInt(eventoSelecionado),
      nivel,
      dataCadastro: new Date().toISOString(),
    };

    try {
      await postItem("squads", dadosCadastro);
      alert("Squad cadastrado com sucesso!");

      // Resetar campos
      setNomeSquad("");
      setNivel("");
      setJogoSelecionado("");
      setEventoSelecionado("");
      setIntegrantes([""]);
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    }
  };

  return (
    <div className="flex justify-center py-10">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-8">
          Cadastre seu Squad!
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Nome do Squad"
            value={nomeSquad}
            onChange={(e) => setNomeSquad(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Selecione o nível do squad</option>
            <option>Iniciante</option>
            <option>Intermediário</option>
            <option>Avançado</option>
            <option>Competitivo</option>
          </select>

          <select
            value={jogoSelecionado}
            onChange={(e) => {
              setJogoSelecionado(e.target.value);
              setEventoSelecionado("");
            }}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Selecione o jogo</option>
            {jogos.map((jogo) => (
              <option key={jogo} value={jogo}>{jogo}</option>
            ))}
          </select>

          {jogoSelecionado && (
            <select
              value={eventoSelecionado}
              onChange={(e) => setEventoSelecionado(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Selecione o evento</option>
              {eventosFiltrados.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.nome} - {evento.dia} ({evento.horario})
                </option>
              ))}
            </select>
          )}

          <div className="space-y-2">
            {integrantes.map((nome, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Integrante ${index + 1}`}
                  value={nome}
                  onChange={(e) => handleIntegranteChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {index > 0 && (
                  <button type="button" onClick={() => removerIntegrante(index)} className="text-red-400 hover:text-red-600">
                    Remover
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={adicionarIntegrante}
              className={`text-pink-500 hover:underline mt-2 ${integrantes.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={integrantes.length >= 5}
            >
              + Adicionar Integrante
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Cadastrar Squad
          </button>
        </form>
      </div>
    </div>
  );
}
