import { Coins, Zap, Gift, Shield, ArrowRight } from 'lucide-react';

export default function Pontos() {
    const packages = [
        { name: "Iniciante", points: 1000, bonus: 50, price: "R$ 10,00", popular: false },
        { name: "Intermediário", points: 5000, bonus: 500, price: "R$ 45,00", popular: true },
        { name: "Elite", points: 10000, bonus: 1500, price: "R$ 85,00", popular: false }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
            <div className="max-w-4xl mx-auto px-4">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-3">
                        <Coins className="w-8 h-8 text-pink-400" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                            Comprar <span className="text-pink-400">Pontos</span>
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Melhore sua experiência de gaming
                    </p>
                </div>

                {/* Saldo */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Seu Saldo</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-800 dark:text-white">1.500</span>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">pontos</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">≈ R$ 15,00</p>
                        </div>
                        <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>

                {/* Pacotes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow mb-8">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                        Escolha seu Pacote
                    </h2>
                    
                    <div className="grid gap-4">
                        {packages.map((pkg, index) => (
                            <div key={index} className={`border rounded-lg p-4 ${pkg.popular ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 dark:text-white">{pkg.name}</h3>
                                        <p className="text-pink-400 font-bold text-lg">
                                            {(pkg.points + pkg.bonus).toLocaleString()} pts
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {pkg.points.toLocaleString()} + {pkg.bonus.toLocaleString()} bônus
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-800 dark:text-white font-bold text-lg">{pkg.price}</p>
                                        <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-1 mt-2">
                                            Comprar
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                {pkg.popular && (
                                    <div className="mt-2">
                                        <span className="bg-pink-400 text-white px-2 py-1 rounded text-xs">Mais Popular</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Como Funciona?</h2>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <p>1. Escolha seu pacote de pontos</p>
                        <p>2. Finalize o pagamento seguro</p>
                        <p>3. Receba os pontos instantaneamente</p>
                        <p>4. Use em conteúdos exclusivos!</p>
                    </div>
                </div>

            </div>
        </div>
    );
}