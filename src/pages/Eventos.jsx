import { useState } from "react";

const eventosPorJogo = {
  "Counter Strike 2": [
    { id: 13, nome: "5v5 Competitivo", dia: "Sábado", horario: "13:00 às 15:00" },
    { id: 14, nome: "2v2 Wingman", dia: "Domingo", horario: "16:00 às 18:00" },
    { id: 15, nome: "Modo Casual", dia: "Sexta", horario: "19:00 às 21:00" },
  ],
  Fortnite: [
    { id: 10, nome: "Solo", dia: "Sábado", horario: "12:00 às 14:00" },
    { id: 11, nome: "Duplas", dia: "Sábado", horario: "15:00 às 17:00" },
    { id: 12, nome: "Squad", dia: "Domingo", horario: "18:00 às 20:00" },
  ],
  "League of Legends": [
    { id: 7, nome: "5v5 Tradicional", dia: "Sábado", horario: "14:00 às 16:00" },
    { id: 8, nome: "ARAM", dia: "Domingo", horario: "17:00 às 19:00" },
    { id: 9, nome: "TFT", dia: "Segunda", horario: "20:00 às 22:00" },
  ],
  "Rocket League": [
    { id: 4, nome: "Duplas", dia: "Quarta", horario: "10:00 às 12:00" },
    { id: 5, nome: "Trio", dia: "Sábado", horario: "15:00 às 17:00" },
    { id: 6, nome: "1x1", dia: "Domingo", horario: "09:00 às 11:00" },
  ],
  Valorant: [
    { id: 1, nome: "Spike Rush", dia: "Sábado", horario: "13:00 às 15:00" },
    { id: 2, nome: "Competitivo", dia: "Domingo", horario: "16:00 às 18:00" },
    { id: 3, nome: "Deathmatch", dia: "Sexta", horario: "20:00 às 22:00" },
  ],
};

export default function Eventos() {
  const games = [
    { id: "cs2", name: "Counter Strike 2", image: "/assets/cs2.png" },
    { id: "fortnite", name: "Fortnite", image: "/assets/fortnite.png" },
    { id: "lol", name: "League of Legends", image: "/assets/League of Legends.png" },
    { id: "rocketleague", name: "Rocket League", image: "/assets/rocket league.jpg" },
    { id: "valorant", name: "Valorant", image: "/assets/valorant.jpg" },
  ];

  const [activeGameId, setActiveGameId] = useState(null);

  const toggleGame = (gameId) => {
    setActiveGameId(prev => (prev === gameId ? null : gameId));
  };

  return (
    <section className="flex items-center justify-center px-2 pt-[80px] pb-[200px] text-white">
      <div className="flex flex-wrap gap-6 justify-center max-w-[1600px]">
        {games.map((game) => {
          const isActive = activeGameId === game.id;
          const eventos = eventosPorJogo[game.name] || [];

          return (
            <div
              key={game.id}
              className="flex flex-col items-center w-[300px]"
            >
              <div
                className="flex relative w-[300px] h-auto rounded-xl overflow-hidden border-2 border-pink-500/15 shadow-[0_0_10px_2px] shadow-pink-500/15 transition-all duration-500 ease-in-out hover:scale-105 cursor-pointer"
                onClick={() => toggleGame(game.id)}
              >
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out"
                  draggable={false}
                />
              </div>

              <div
                className={`w-full mt-9 bg-gray-800/90 rounded-lg px-4 overflow-hidden transition-all duration-500 ${isActive ? "max-h-[500px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
                  }`}
              >
                <ul className="text-base space-y-2">
                  {eventos.map(({ id, modo, dia, horario }) => (
                    <li key={id}>
                      <span className="font-medium">{modo}</span> — {dia}, {horario}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 text-center">
                  <a
                    href="/cadastro"
                    className="bg-pink-500 hover:bg-pink-600 text-white text-base py-[6px] px-4 rounded-md transition"
                  >
                    Inscreva-se
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
