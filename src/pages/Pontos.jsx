import { useState, useEffect } from 'react';
import { Coins, Zap, TrendingUp, Gift, Shield, Clock, ArrowRight } from 'lucide-react';

export default function PointsPage() {
    const [balance, setBalance] = useState(1500);
    const [conversionRate] = useState(100); // 100 pontos = R$ 1,00

    const packages = [
        {
            name: "Pacote Iniciante",
            points: 1000,
            bonus: 50,
            originalPrice: 10.00,
            finalPrice: 10.00,
            popular: false
        },
        {
            name: "Pacote Intermediário",
            points: 5000,
            bonus: 500,
            originalPrice: 50.00,
            finalPrice: 45.00,
            popular: true
        },
        {
            name: "Pacote Elite",
            points: 10000,
            bonus: 1500,
            originalPrice: 100.00,
            finalPrice: 85.00,
            popular: false
        }
    ];

    const calculateBRL = (points) => {
        return (points / conversionRate).toFixed(2);
    };

    return (
        <div className="flex justify-center py-10 px-4">
            <div className="w-full max-w-6xl space-y-8">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl p-3">
                            <Coins className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                            Purchase Game <span className="text-pink-400 dark:text-pink-400">Points</span>
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Enhance your gaming experience. Compre pontos e desbloqueie vantagens exclusivas!
                    </p>
                </div>

                {/* Seu Saldo Atual */}
                <section className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-pink-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                Seu Saldo Atual
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Visualize seu saldo de pontos aqui! Mantenha o controle dos seus pontos e saiba quando recarregar.
                            </p>
                            
                            <div className="flex items-end gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        Saldo Disponível
                                    </div>
                                    <div className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                                        {balance.toLocaleString()}
                                    </div>
                                    <div className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                                        ≈ R$ {calculateBRL(balance)}
                                    </div>
                                </div>
                                <div className="h-12 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Taxa de Conversão
                                    </div>
                                    <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mt-1">
                                        100 pts = R$ 1,00
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">Saldo Seguro</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pacotes de Pontos */}
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Pacotes de Pontos Disponíveis
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Escolha o pacote que melhor se adapta às suas necessidades
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, index) => (
                            <div 
                                key={index}
                                className={`relative rounded-xl border-2 p-6 transition-all hover:scale-105 ${
                                    pkg.popular 
                                        ? 'border-pink-400 bg-gradient-to-b from-pink-50 to-white dark:from-gray-700 dark:to-gray-800' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-pink-400 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Mais Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        {pkg.name}
                                    </h3>
                                    <div className="text-3xl font-bold text-pink-400 dark:text-pink-400 mb-1">
                                        {(pkg.points + pkg.bonus).toLocaleString()} pts
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {pkg.points.toLocaleString()} + {pkg.bonus.toLocaleString()} bônus
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Valor:</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                                            R$ {pkg.finalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    {pkg.originalPrice > pkg.finalPrice && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Economia:</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                R$ {(pkg.originalPrice - pkg.finalPrice).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Custo por 100 pts:</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                                            R$ {((pkg.finalPrice / (pkg.points + pkg.bonus)) * 100).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2">
                                    <Coins className="w-5 h-5" />
                                    Comprar Agora
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Como Funciona */}
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                            Como Funciona?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nosso sistema de pontos é simples e vantajoso
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <Coins className="w-8 h-8" />,
                                title: "Escolha seu pacote",
                                description: "Selecione o pacote de pontos que melhor se adapta às suas necessidades"
                            },
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: "Finalize a compra",
                                description: "Realize o pagamento de forma segura e rápida"
                            },
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: "Receba seus pontos",
                                description: "Os pontos serão creditados automaticamente em sua conta"
                            },
                            {
                                icon: <Gift className="w-8 h-8" />,
                                title: "Aproveite!",
                                description: "Utilize seus pontos para desbloquear conteúdos exclusivos"
                            }
                        ].map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                                    {step.icon}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Próximos Passos */}
                <section className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                        Próximos Passos
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                        Agora que você já sabe como adquirir e usar seus pontos, explore as opções disponíveis e turbine sua experiência game!
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <TrendingUp className="w-6 h-6" />,
                                title: "Verifique seu saldo",
                                description: "Mantenha-se atualizado sobre seus pontos"
                            },
                            {
                                icon: <Gift className="w-6 h-6" />,
                                title: "Explore os benefícios",
                                description: "Descubra onde seus pontos podem te levar"
                            },
                            {
                                icon: <Clock className="w-6 h-6" />,
                                title: "Fique por dentro",
                                description: "Acompanhe nossas promoções e eventos especiais"
                            }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-pink-400 dark:text-pink-400 mb-2 flex justify-center">
                                    {item.icon}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}

