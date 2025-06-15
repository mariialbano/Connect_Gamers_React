import { useState } from "react";
import { Link } from "react-router-dom";

const jogos = [
  {
    id: "cs2",
    nome: "Counter Strike 2",
    imagem: "/assets/cs2.png",
    eventos: [
      { dia: "Sábado", horario: "13:00 às 15:00", modo: "5v5" },
      { dia: "Sábado", horario: "16:00 às 18:00", modo: "5v5" },
      { dia: "Domingo", horario: "10:00 às 12:00", modo: "2v2" },
      { dia: "Quarta-feira", horario: "18:00 às 20:00", modo: "1v1" },
    ],
  },
  {
    id: "fortnite",
    nome: "Fortnite",
    imagem: "/assets/fortnite.png",
    eventos: [
      { dia: "Sexta-feira", horario: "14:00 às 16:00", modo: "Solo" },
      { dia: "Sábado", horario: "16:00 às 18:00", modo: "Dupla" },
      { dia: "Sábado", horario: "13:00 às 15:00", modo: "Squad" },
      { dia: "Domingo", horario: "11:00 às 13:00", modo: "Squad" },
    ],
  },
  {
    id: "lol",
    nome: "League of Legends",
    imagem: "/assets/League of Legends.png",
    eventos: [
      { dia: "Segunda-feira", horario: "19:00 às 21:00", modo: "5v5" },
      { dia: "Sábado", horario: "17:00 às 19:00", modo: "5v5" },
      { dia: "Quarta-feira", horario: "20:00 às 22:00", modo: "ARAM" },
      { dia: "Sábado", horario: "15:00 às 17:00", modo: "TFT" },
    ],
  },
  {
    id: "rocketleague",
    nome: "Rocket League",
    imagem: "/assets/rocket league.jpg",
    eventos: [
      { dia: "Terça-feira", horario: "13:00 às 15:00", modo: "2v2" },
      { dia: "Quinta-feira", horario: "18:00 às 20:00", modo: "3v3" },
      { dia: "Sábado", horario: "11:00 às 13:00", modo: "5v5" },
      { dia: "Domingo", horario: "10:00 às 12:00", modo: "1v1" },
    ],
  },
  {
    id: "valorant",
    nome: "Valorant",
    imagem: "/assets/valorant.jpg",
    eventos: [
      { dia: "Quarta-feira", horario: "17:00 às 19:00", modo: "5v5" },
      { dia: "Sábado", horario: "13:00 às 15:00", modo: "Spike Rush" },
      { dia: "Sábado", horario: "16:00 às 18:00", modo: "Dupla" },
      { dia: "Domingo", horario: "14:00 às 16:00", modo: "Deathmatch" },
    ],
  },
];

export default function Eventos() {
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const handleClick = (id) => {
    const jogo = jogos.find((j) => j.id === id);
    setJogoSelecionado(jogo);
  };

  return (
    <section className="w-full min-h-screen pt-28 text-white px-4">
      <div className="max-w-5xl mx-auto">
        {/* Lista de jogos */}
        <div className="flex flex-wrap justify-center gap-6 p-4 rounded-xl bg-[#1a1a1d] shadow-xl border border-pink-500">
          {jogos.map((jogo) => (
            <img
              key={jogo.id}
              src={jogo.imagem}
              alt={jogo.nome}
              className="w-40 h-40 object-cover rounded-md cursor-pointer transition-transform hover:scale-105 border-2 border-transparent hover:border-pink-500"
              onClick={() => handleClick(jogo.id)}
            />
          ))}
        </div>

        {/* Eventos */}
        {jogoSelecionado && (
          <div className="mt-10 p-6 bg-[#1a1a1d] border border-pink-500 rounded-xl shadow-xl max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-pink-400 mb-4">
              {jogoSelecionado.nome}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white mb-6">
              {jogoSelecionado.eventos.map((evento, index) => (
                <div key={index}>
                  <p className="font-semibold">Modo de Jogo {evento.modo}</p>
                  <p>{evento.dia}</p>
                  <p>{evento.horario}</p>
                </div>
              ))}
            </div>
            <Link to="/cadastro">
              <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded">
                Cadastrar-se
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
