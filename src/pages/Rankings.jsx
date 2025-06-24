import React, { useState } from 'react';

const Rankings = () => {
  const [mostrarCompetitivos, setMostrarCompetitivos] = useState(false);
  const [jogadorAtivo, setJogadorAtivo] = useState(null);

  const listaJogadores = [
    { nome: "Ana", pontos: 1200, competitivo: true, kd: 1.5 },
    { nome: "Carlos", pontos: 850, competitivo: false, kd: 0.9 },
    { nome: "João", pontos: 950, competitivo: true, kd: 1.2 },
    { nome: "Lúcia", pontos: 700, competitivo: false, kd: 0.8 },
  ];

  const jogadoresExibidos = mostrarCompetitivos
    ? listaJogadores.filter(j => j.competitivo)
    : listaJogadores;

  const alternarJogador = (index) => {
    setJogadorAtivo(jogadorAtivo === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Ranking de Jogadores
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => setMostrarCompetitivos(prev => !prev)}
          className={`px-6 py-2 font-semibold rounded-full transition duration-300 text-sm ${
            mostrarCompetitivos
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
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
            className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 hover:bg-gray-200 transition duration-150"
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
  );
};

export default Rankings;



