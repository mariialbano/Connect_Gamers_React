import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';

const Rankings = () => {
  const [mostrarCompetitivos, setMostrarCompetitivos] = useState(false);
  const [jogadorAtivo, setJogadorAtivo] = useState(null);
  const [animar, setAnimar] = useState([]);
  const { theme } = useTheme();

  const listaJogadores = [
    { nome: "Ana", pontos: 1200, competitivo: true, kd: 1.5 },
    { nome: "Carlos", pontos: 850, competitivo: false, kd: 0.9 },
    { nome: "João", pontos: 950, competitivo: true, kd: 1.2 },
    { nome: "Lúcia", pontos: 700, competitivo: false, kd: 0.8 },
  ];

  const jogadoresExibidos = mostrarCompetitivos
    ? listaJogadores.filter(j => j.competitivo)
    : listaJogadores;

  useEffect(() => {
    setAnimar([]); // Reset animação ao trocar filtro
    jogadoresExibidos.forEach((_, i) => {
      setTimeout(() => {
        setAnimar(prev => [...prev, i]);
      }, 120 * i);
    });
  }, [mostrarCompetitivos]);

  const alternarJogador = (index) => {
    setJogadorAtivo(jogadorAtivo === index ? null : index);
  };

  return (
    <div className="flex justify-center py-14 px-4">
      <div className={
        theme === "dark"
          ? "bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl text-white my-16 mb-36"
          : "bg-[#d9dbe2] p-8 rounded-xl shadow-lg w-full max-w-3xl text-black my-16 mb-36"
      }>
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-6">
          Ranking de Jogadores
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMostrarCompetitivos(prev => !prev)}
            className={`px-6 py-2 font-semibold rounded-full transition duration-300 text-sm ${
              mostrarCompetitivos
                ? 'bg-gray-600/80 text-white hover:bg-gray-700'
                : 'bg-gray-400/80  text-black hover:bg-gray-400'
            }`}
          >
            {mostrarCompetitivos
              ? 'Exibindo: Apenas Competitivos'
              : 'Exibindo: Todos os Jogadores'}
          </button>
        </div>

        <ul className="space-y-3">
          {jogadoresExibidos.map((jogador, index) => (
            <li
              key={index}
              className={`border border-gray-300 rounded-lg px-4 py-3 hover:scale-105 transition-all duration-500
                ${theme === "dark"
                  ? "bg-gray-300 hover:bg-gray-300/85"
                  : "bg-gray-100 hover:bg-gray-400/85"
                }
                ${animar.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
              `}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <button
                className="w-full text-left text-gray-800 font-medium text-lg hover:underline"
                onClick={() => alternarJogador(index)}
              >
                {jogador.nome}
              </button>

              {jogadorAtivo === index && (
                <div className="mt-3 text-gray-700 text-sm space-y-2">
                  <p><strong>Pontuação:</strong> {jogador.pontos}</p>
                  <p><strong>K/D Ratio:</strong> {jogador.kd}</p>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Desempenho Visual (baseado na pontuação)</p>
                    <div className="w-full bg-gray-300 h-4 rounded overflow-hidden">
                      <div
                        className="h-full bg-pink-500 transition-all duration-500"
                        style={{ width: `${(jogador.pontos / 1500) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Rankings;



