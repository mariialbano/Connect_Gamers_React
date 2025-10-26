import React, { useState } from 'react';

// Dados das perks
const perksData = [
  { id: 1, cost: 25, description: 'Receba 50% de reembolso caso perca o evento' },
  { id: 2, cost: 25, description: 'Ganhe 2x mais pontos em 1 evento específico' },
  { id: 3, cost: 50, description: 'Ganha 2x mais pontos por 2h' },
  { id: 4, cost: 100, description: 'Ganha 2x mais pontos por 5h' },
  { id: 5, cost: 300, description: '1 mês de premium' },
];

const GIFT_IMAGE_PATH = '/assets/perk.png';

const Resgates = () => {
  const [userBalance, setUserBalance] = useState(100);

  const handleResgate = (perk) => {
    if (userBalance >= perk.cost) {
      alert(`Perk "${perk.description}" resgatada!`);
      setUserBalance(userBalance - perk.cost);
    }
  };

  return (
    <div className="w-11/12 max-w-6xl mx-auto my-8">
      <h1 className="text-center text-3xl font-bold text-gray-800 dark:text-white mb-8">
        Resgate suas perks
      </h1>

      <div className="text-center text-xl font-bold text-gray-700 dark:text-gray-300 mb-8">
        <h3>Seu Saldo: {userBalance} pontos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {perksData.map((perk) => {
          const hasEnoughPoints = userBalance >= perk.cost;

          return (
            <div
              key={perk.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1"
            >
              {/* Imagem e Conteúdo do Card */}
              <div className="p-6 flex flex-col items-center justify-center flex-grow">
                {/* AQUI ESTÁ A IMAGEM */}
                <img
                  src={GIFT_IMAGE_PATH}
                  alt="Ícone de presente de perk"
                  className="w-24 h-24 object-contain mb-4"
                />
                <p className="text-center text-gray-700 dark:text-gray-200 text-lg">
                  {perk.description}
                </p>
              </div>

              {/* Footer do Card */}
              <div className="bg-gray-800 dark:bg-black text-white p-6 flex flex-col">
                <span className="text-sm font-bold mb-3">
                  {perk.cost} pontos
                </span>

                <button
                  className="w-full py-3 px-4 text-base font-bold text-white bg-pink-600 rounded-lg transition-colors hover:bg-pink-700 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                  onClick={() => handleResgate(perk)}
                  disabled={!hasEnoughPoints}
                >
                  {hasEnoughPoints ? 'Resgatar' : 'Pontos Insuficientes'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Resgates;