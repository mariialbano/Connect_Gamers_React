import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { eventosTeste } from "../data/eventos.js";

// Lista para garantir a ordem dos jogos 
const gameOrder = ['Fortnite', 'Valorant', 'Counter Strike 2', 'League of Legends', 'Rocket League'];

// Jogos e seus nomes de exibição
const displayNames = {
  'Fortnite': 'Fortnite',
  'Valorant': 'Valorant',
  'Counter Strike 2': 'CSGO', // De "Counter Strike 2" para "Evento CSGO"
  'League of Legends': 'League of Legends',
  'Rocket League': 'Rocket League'
};

export default function Home() {
  return (
    <div className="flex flex-col items-center py-6 px-4 w-full">
      
      {/* ===== Bloco Principal (Bem-vindo) ===== */}
      <div className="bg-[#d9dbe2] dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl text-black dark:text-white relative mb-12">
        <div className="absolute top-0 right-0 w-20 h-20 bg-pink-600 rounded-full opacity-20 -mt-10 -mr-10"></div>

        <h2 className="text-3xl font-bold mb-2 text-black dark:text-white text-center">
          Bem-vindo ao Connect Gamers
        </h2>
        <h3 className="text-xl font-semibold mb-6 text-pink-800 dark:text-pink-400 text-center">
          A sua arena de eSports!
        </h3>

        <div className="text-left leading-relaxed text-sm text-gray-800 dark:text-gray-200">
          <p className="mb-4">
            Conecte-se, compita e conquiste! Somos a plataforma definitiva para alunos apaixonados por games. Desafie suas habilidades em torneios de Valorant, CS:GO, League of Legends e muito mais.
          </p>
          <p className="font-semibold mb-3">Como Funciona:</p>
          
          <p className="mb-4 space-y-1">
            <span>• <strong>Cadastre-se:</strong> Crie seu perfil de jogador.</span><br />
            <span>• <strong>Monte sua Equipe:</strong> Encontre outros alunos e forme seu time.</span><br />
            <span>• <strong>Compita:</strong> Inscreva-se nos eventos e lute pelo topo!</span>
          </p>
          
          <p>
            Mais do que vitórias, construímos uma comunidade. Encontre novos amigos, fortaleça seu time e evolua suas habilidades em um ambiente divertido e competitivo.
            <br />
            Pronto para o desafio? Junte-se a nós!
          </p>
        </div>

        <div className="mt-8 text-right">
          <Link
            to="/comunidade"
            className="inline-flex items-center gap-2 text-pink-800 dark:text-pink-400 hover:underline font-semibold group"
            aria-label="Ir para Comunidade"
          >
            <span>Ir para Comunidade</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Nova Seção: Blocos de Eventos  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl">
        
        {/* Mapeia a lista "gameOrder" para garantir a ordem */}
        {gameOrder.map((gameName) => {
          
          // Pega a lista de eventos para este jogo
          const gameEvents = eventosTeste[gameName];
          
          // Se não houver eventos, não mostra o card
          if (!gameEvents || gameEvents.length === 0) {
            return null;
          }
          
          // Pega o *primeiro evento* da lista para mostrar o horário
          const firstEvent = gameEvents[0];
          // Pega o nome de exibição (ex: "Evento CSGO")
          const displayName = displayNames[gameName];

          return (
         <Link
         key={gameName}
         to="/inscreva-se"
         className="block bg-[#d9dbe2] dark:bg-gray-800 p-6 rounded-xl shadow-lg text-black dark:text-white text-center transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl min-h-32 flex flex-col justify-center"
         >

          <h4 className="text-xl font-bold mb-2 whitespace-normal" title={displayName}>
            {displayName}
            </h4>
            <p className="text-sm font-semibold text-pink-800 dark:text-pink-400">
              {firstEvent.dia}, {firstEvent.horario}
              </p>
              </Link>
          );
        })}
      </div>

    </div>
  );
}
