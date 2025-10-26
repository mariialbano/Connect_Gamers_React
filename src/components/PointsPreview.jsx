import { useState } from 'react';
import { Coins, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PointsPreview() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-400 transition-colors text-sm">
                <Coins className="w-4 h-4" />
                <span>Pontos</span>
            </button>

            {isVisible && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
                    {/* Header menor */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-pink-400 rounded p-1">
                            <Coins className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Seus Pontos</h3>
                        </div>
                    </div>

                    {/* Saldo compacto */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Saldo</span>
                            <Zap className="w-3 h-3 text-yellow-500" />
                        </div>
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            1.500
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            ≈ R$ 15,00
                        </div>
                    </div>

                    {/* Botão compacto */}
                    <Link 
                        to="/pontos"
                        className="block w-full bg-pink-500 hover:bg-pink-600 text-white text-center py-2 rounded-lg transition-colors text-sm font-medium"
                        onClick={() => setIsVisible(false)}
                    >
                        Comprar Pontos
                    </Link>
                </div>
            )}
        </div>
    );
}
