import { Leaf, BookOpen, Lightbulb, Users, Globe, Zap, Heart } from "lucide-react";

export default function ESG() {
    return (
        <div className="flex justify-center py-10 px-4">
            <div className="w-full max-w-6xl space-y-8">

                <div className="text-center">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                            ESG na <span className="text-pink-400 dark:text-pink-400">Connect Gamers</span>
                        </h1>
                    </div>
                </div>

                {/* Nosso Compromisso */}
                <section className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-green-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
                        Nosso Compromisso ESG
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6 mt-6">
                        <div className="text-center">
                            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Ambiental</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Redução contínua da pegada de carbono através de tecnologias eficientes e conscientização
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Social</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Comunidade inclusiva, diversa e segura com moderação ética e respeito mútuo
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Governança</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Transparência nas operações, privacidade de dados e tomada de decisão responsável
                            </p>
                        </div>
                    </div>
                </section>

                {/* Simulação de Impacto Digital */}
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-6 h-6 text-pink-400 dark:text-pink-400" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Impacto Digital</h2>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        A Connect Gamers foi projetada para ser uma plataforma leve e eficiente. Veja o impacto estimado de diferentes padrões de uso:
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Uso Casual */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                Uso Casual
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tempo médio:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">1h/dia</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dados/mês:</span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">~60 MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">CO₂/mês:</span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">~2.4g</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Energia:</span>
                                    <span className="font-semibold text-green-700 dark:text-green-300">~3.6 Wh</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Equivalente a uma lâmpada LED ligada por 1 minuto
                            </p>
                        </div>

                        {/* Uso Regular */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                Uso Regular
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tempo médio:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">3h/dia</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dados/mês:</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">~180 MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">CO₂/mês:</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">~7.2g</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Energia:</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">~10.8 Wh</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Equivalente a uma lâmpada LED ligada por 3 minutos
                            </p>
                        </div>

                        {/* Uso Intenso */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                                Uso Intenso
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tempo médio:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">6h/dia</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dados/mês:</span>
                                    <span className="font-semibold text-orange-700 dark:text-orange-300">~360 MB</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">CO₂/mês:</span>
                                    <span className="font-semibold text-orange-700 dark:text-orange-300">~14.4g</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Energia:</span>
                                    <span className="font-semibold text-orange-700 dark:text-orange-300">~21.6 Wh</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Equivalente a uma lâmpada LED ligada por 6 minutos
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-50 dark:bg-gray-700/40 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Valores educativos e podem variar conforme dispositivo, rede e padrão de uso real.
                        </p>
                    </div>
                </section>

                {/* Módulo Educacional */}
                <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-pink-400 dark:text-pink-400" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Educação Socioambiental</h2>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Aprenda sobre práticas sustentáveis no gaming e tecnologia, e como podemos construir uma comunidade mais responsável.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Gaming Sustentável */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Gaming Sustentável</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Use modo escuro para reduzir consumo de energia em telas OLED</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Ajuste o brilho da tela para níveis confortáveis (economia de até 20%)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Prefira Wi-Fi a dados móveis quando possível (menor consumo)</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Feche abas e apps em segundo plano para otimizar recursos</span>
                                </li>
                            </ul>
                        </div>

                        {/* Responsabilidade Social */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Responsabilidade Social</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                                    <span>Promova inclusão e respeito à diversidade na comunidade</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                                    <span>Denuncie comportamentos tóxicos ou discriminatórios</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                                    <span>Compartilhe conhecimento e ajude novos jogadores</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                                    <span>Mantenha equilíbrio entre gaming e bem-estar pessoal</span>
                                </li>
                            </ul>
                        </div>

                        {/* Tecnologia Verde */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Tecnologia Verde</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Nossa plataforma utiliza código otimizado e caching eficiente</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Servidores com práticas sustentáveis e energia renovável</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Compressão de imagens e assets para reduzir transferência de dados</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 dark:text-green-400">✓</span>
                                    <span>Design responsivo que se adapta a qualquer dispositivo</span>
                                </li>
                            </ul>
                        </div>

                        {/* Impacto Coletivo */}
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Impacto Coletivo</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex gap-2">
                                    <span className="text-pink-600 dark:text-pink-400">✓</span>
                                    <span>Pequenas ações individuais geram grande impacto coletivo</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-pink-600 dark:text-pink-400">✓</span>
                                    <span>Compartilhe práticas sustentáveis com seu squad</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-pink-600 dark:text-pink-400">✓</span>
                                    <span>Participe de iniciativas da comunidade para o bem comum</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-pink-600 dark:text-pink-400">✓</span>
                                    <span>Monitore e reduza seu consumo digital conscientemente</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
