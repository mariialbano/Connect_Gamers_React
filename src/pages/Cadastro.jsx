import { useState } from "react";

const eventosPorJogo = {
  "Counter Strike 2": [
    { id: 1, modo: "5v5", dia: "Sábado", horario: "13:00 às 15:00" },
    { id: 2, modo: "5v5", dia: "Sábado", horario: "16:00 às 18:00" },
    { id: 3, modo: "2v2", dia: "Domingo", horario: "10:00 às 12:00" },
    { id: 4, modo: "1v1", dia: "Quarta-feira", horario: "18:00 às 20:00" },
  ],
  Fortnite: [
    { id: 1, modo: "Solo", dia: "Sexta-feira", horario: "14:00 às 16:00" },
    { id: 2, modo: "Dupla", dia: "Sábado", horario: "16:00 às 18:00" },
    { id: 3, modo: "Squad", dia: "Sábado", horario: "13:00 às 15:00" },
    { id: 4, modo: "Squad", dia: "Domingo", horario: "11:00 às 13:00" },
  ],
  "League of Legends": [
    { id: 1, modo: "5v5", dia: "Segunda-feira", horario: "19:00 às 21:00" },
    { id: 2, modo: "5v5", dia: "Sábado", horario: "17:00 às 19:00" },
    { id: 3, modo: "ARAM", dia: "Quarta-feira", horario: "20:00 às 22:00" },
    { id: 4, modo: "TFT", dia: "Sábado", horario: "15:00 às 17:00" },
  ],
  "Rocket League": [
    { id: 1, modo: "2v2", dia: "Terça-feira", horario: "13:00 às 15:00" },
    { id: 2, modo: "3v3", dia: "Quinta-feira", horario: "18:00 às 20:00" },
    { id: 3, modo: "5v5", dia: "Sábado", horario: "11:00 às 13:00" },
    { id: 4, modo: "1v1", dia: "Domingo", horario: "10:00 às 12:00" },
  ],
  Valorant: [
    { id: 1, modo: "5v5", dia: "Quarta-feira", horario: "17:00 às 19:00" },
    { id: 2, modo: "Spike Rush", dia: "Sábado", horario: "13:00 às 15:00" },
    { id: 3, modo: "Dupla", dia: "Sábado", horario: "16:00 às 18:00" },
    { id: 4, modo: "Deathmatch", dia: "Domingo", horario: "14:00 às 16:00" },
  ],
};

export default function Cadastro() {
  const [integrantes, setIntegrantes] = useState([""]);
  const [jogoSelecionado, setJogoSelecionado] = useState("");
  const [eventoSelecionado, setEventoSelecionado] = useState("");

  const adicionarIntegrante = () => {
    if (integrantes.length < 5) {
      setIntegrantes([...integrantes, ""]);
    }
  };

  const handleChange = (index, value) => {
    const novosIntegrantes = [...integrantes];
    novosIntegrantes[index] = value;
    setIntegrantes(novosIntegrantes);
  };

  const eventosDisponiveis = eventosPorJogo[jogoSelecionado] || [];

  return (
    <div className="flex justify-center py-10">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-8">
          Cadastre seu Squad!
        </h1>

        <form className="space-y-6">

          {/* Nome do Squad */}
          <input
            type="text"
            placeholder="Nome do Squad"
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {/* Integrantes Dinâmicos */}
          <div>
            <label className="block text-left mb-2 text-sm font-semibold text-white">
              Integrantes:
            </label>
            <div className="space-y-3">
              {integrantes.map((nome, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Integrante ${index + 1}`}
                  value={nome}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              ))}
            </div>
            {integrantes.length < 5 && (
              <button
                type="button"
                onClick={adicionarIntegrante}
                className="mt-3 flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition"
              >
                <span className="text-xl font-bold">+</span> Adicionar integrante
              </button>
            )}
          </div>

          {/* Seleção de Jogo */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white">
              Selecione um jogo:
            </label>
            <select
              value={jogoSelecionado}
              onChange={(e) => {
                setJogoSelecionado(e.target.value);
                setEventoSelecionado(""); // reset evento ao mudar de jogo
              }}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Selecione um jogo</option>
              {Object.keys(eventosPorJogo).map((jogo) => (
                <option key={jogo} value={jogo}>
                  {jogo}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção de Evento (dinâmica) */}
          {eventosDisponiveis.length > 0 && (
            <div>
              <label className="block mb-2 text-sm font-semibold text-white">
                Escolha um evento:
              </label>
              <select
                value={eventoSelecionado}
                onChange={(e) => setEventoSelecionado(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Selecione um evento</option>
                {eventosDisponiveis.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {`${evento.modo} - ${evento.dia}, ${evento.horario}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nível do Squad */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white">
              Escolha o nível do seu squad:
            </label>
            <select className="w-full px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option>Selecione um nível</option>
              <option>Iniciante</option>
              <option>Intermediário</option>
              <option>Avançado</option>
              <option>Competitivo</option>
            </select>
          </div>

          {/* Botão de cadastro */}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}
