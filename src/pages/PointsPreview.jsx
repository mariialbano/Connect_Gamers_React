import { useState } from 'react';
import { Coins, Zap, TrendingUp } from 'lucide-react';

export default function PointsPreview() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-400 dark:hover:text-pink-400 transition-colors">
                <Coins className="w-5 h-5" />
                <span>Pontos</span>
            </button>

            {isVisible && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg p-2">
                            <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100">Seus Pontos</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie seu saldo</p>
                        </div>
                    </div>

                    {/* Saldo Atual */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Saldo Atual</span>
                            <Zap className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                            1.500
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ≈ R$ 15,00
                        </div>
                    </div>

                    {/* Ações Rápidas */}
                    <div className="space-y-2">
                        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                            <Coins className="w-4 h-4" />
                            Comprar Pontos
                        </button>
                        <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Ver Histórico
                        </button>
                    </div>

                    {/* Dica */}
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                            Ganhe bônus em pacotes maiores!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}