import { Coins, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LayoutWrapper from '../components/LayoutWrapper';
import { Card, Button, Badge } from '../components/ui';

export default function Pontos() {
    const [saldo] = useState(1500); // Exemplo de estado para saldo
    const packages = [
        { name: "Iniciante", points: 1000, bonus: 50, price: "R$ 10,00", popular: false },
        { name: "Intermediário", points: 5000, bonus: 500, price: "R$ 45,00", popular: true },
        { name: "Elite", points: 10000, bonus: 1500, price: "R$ 85,00", popular: false }
    ];

    const handlePurchase = (pkg) => {
        alert(`Você comprou o pacote ${pkg.name} com ${pkg.points + pkg.bonus} pontos!`);
        // Aqui você poderia integrar com backend ou atualizar o saldo
    };

    return (
        <LayoutWrapper variant="points" className="py-6">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <Badge variant="primary" size="lg" className="mb-4">
                        💰 Sistema de Pontos
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Compre <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">pontos</span> e ganhe mais!
                    </h1>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto mb-6">
                        Melhore sua experiência de gaming com nosso sistema de pontos exclusivo
                    </p>
                    <Link to="/gamepoints" className="inline-block">
                        <Button variant="accent" size="lg" className="shadow-glow">
                            ▶ Solicitar Saque (DEMO)
                        </Button>
                    </Link>
                </div>

                {/* Saldo */}
                <Card variant="glass" className="p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Seu Saldo</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">{saldo.toLocaleString()}</span>
                                <span className="text-white/70 text-sm">pontos</span>
                            </div>
                            <p className="text-white/60 text-sm">≈ R$ {(saldo / 100).toFixed(2)}</p>
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </Card>

                {/* Pacotes */}
                <Card variant="glass" className="p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6 text-center">
                        Escolha seu Pacote
                    </h2>

                    <div className="grid gap-4">
                        {packages.map((pkg, index) => (
                            <Card
                                key={index}
                                variant={pkg.popular ? "gradient" : "flat"}
                                className={`p-4 ${pkg.popular ? 'ring-2 ring-primary-400' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-neutral-900 dark:text-neutral-100">{pkg.name}</h3>
                                            {pkg.popular && (
                                                <Badge variant="accent" size="xs">Mais Popular</Badge>
                                            )}
                                        </div>
                                        <p className="text-primary-500 font-bold text-lg">
                                            {(pkg.points + pkg.bonus).toLocaleString()} pts
                                        </p>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                            {pkg.points.toLocaleString()} + {pkg.bonus.toLocaleString()} bônus
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-neutral-900 dark:text-neutral-100 font-bold text-lg">{pkg.price}</p>
                                        <Button
                                            onClick={() => handlePurchase(pkg)}
                                            variant="primary"
                                            size="sm"
                                            className="mt-2 shadow-soft hover:shadow-medium"
                                        >
                                            Comprar
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>

                {/* Info */}
                <Card variant="glass" className="p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Como Funciona?</h2>
                    <div className="space-y-3 text-sm text-white/80">
                        <p>1. Escolha seu pacote de pontos</p>
                        <p>2. Finalize o pagamento seguro</p>
                        <p>3. Receba os pontos instantaneamente</p>
                        <p>4. Use em conteúdos exclusivos!</p>
                    </div>
                </Card>

            </div>
        </LayoutWrapper>
    );
}

