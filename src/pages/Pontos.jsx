import React, { useState } from "react";

export default function Pontos() {
    const [saldo, setSaldo] = useState(75);
    const [mensagem, setMensagem] = useState("");
    const [mostrarMensagem, setMostrarMensagem] = useState(false);
    const [historico, setHistorico] = useState([]);

    // Valor de conversão dos pontos para reais
    const valorPorPonto = 0.01;
    const saldoEmReais = (saldo * valorPorPonto).toFixed(2);

    // Pacotes disponíveis
    const pacotes = [
        { id: 1, nome: "Pacote Iniciante", pontos: 1000, bonus: 50, preco: "R$9,90" },
        { id: 2, nome: "Pacote Intermediário", pontos: 5000, bonus: 500, preco: "R$24,90" },
        { id: 3, nome: "Pacote Elite", pontos: 10000, bonus: 1500, preco: "R$49,90" },
    ];

    // Função de compra
    const comprarPacote = (pacote) => {
        const total = pacote.pontos + pacote.bonus;
        const dataCompra = new Date().toLocaleString("pt-BR");

        setSaldo((prev) => prev + total);
        setMensagem(`Compra realizada com sucesso! +${total.toLocaleString()} pontos.`);
        setMostrarMensagem(true);

        setHistorico((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                nome: pacote.nome,
                pontos: total,
                preco: pacote.preco,
                data: dataCompra,
            },
        ]);

        setTimeout(() => setMostrarMensagem(false), 3000);
    };

    return (
        <div className="min-h-screen bg-[#2a2f3b] text-white py-12 px-6">
            <div className="max-w-5xl mx-auto text-center">
                {/* Título e descrição */}
                <h1 className="text-3xl font-bold mb-2 text-pink-500">Compre seus Pontos</h1>
                <p className="text-gray-300 mb-8">
                    Adquira pontos para desbloquear benefícios exclusivos e turbinar sua experiência gamer.
                </p>

                {/* Saldo atual */}
                <div className="bg-[#1c1f26] rounded-2xl p-6 mb-10 shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">Seu Saldo Atual</h2>
                    <p className="text-2xl font-bold text-pink-500">{saldo.toLocaleString()} pontos</p>
                    <p className="text-gray-400 text-sm">
                        Equivalente a <span className="text-pink-400 font-semibold">R${saldoEmReais}</span>
                    </p>
                </div>

                {/* Mensagem de sucesso */}
                {mostrarMensagem && (
                    <div className="bg-pink-600 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-semibold inline-block mb-6">
                        {mensagem}
                    </div>
                )}

                {/* Pacotes */}
                <h2 className="text-2xl font-semibold mb-6">Pacotes Disponíveis</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {pacotes.map((pacote) => (
                        <div key={pacote.id} className="bg-[#1c1f26] rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-pink-400 mb-2">{pacote.nome}</h3>
                            <p className="text-gray-300">💎 {pacote.pontos} pontos</p>
                            <p className="text-gray-400 text-sm mb-3">+ {pacote.bonus} pontos bônus</p>
                            <p className="text-xl font-bold text-pink-500 mb-4">{pacote.preco}</p>

                            <button
                                onClick={() => comprarPacote(pacote)}
                                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-xl w-full transition"
                            >
                                Comprar Agora
                            </button>
                        </div>
                    ))}
                </div>

                {/* Como funciona */}
                <div className="mt-12 text-left max-w-3xl mx-auto">
                    <h3 className="text-xl font-semibold text-pink-400 mb-3">Como Funciona</h3>
                    <ol className="list-decimal list-inside text-gray-300 space-y-2">
                        <li>Escolha o pacote de pontos que deseja comprar.</li>
                        <li>Finalize a compra de forma rápida e segura.</li>
                        <li>Receba seus pontos automaticamente na conta.</li>
                        <li>Use-os para obter vantagens exclusivas dentro da plataforma.</li>
                    </ol>
                </div>

                {/* Histórico */}
                {historico.length > 0 && (
                    <div className="mt-12 bg-[#1c1f26] rounded-2xl p-6 shadow-lg text-left max-w-4xl mx-auto">
                        <h3 className="text-xl font-semibold text-pink-400 mb-4">Histórico de Compras</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-gray-300 text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700 text-pink-400">
                                        <th className="py-2 text-left">Pacote</th>
                                        <th className="py-2 text-left">Pontos</th>
                                        <th className="py-2 text-left">Preço</th>
                                        <th className="py-2 text-left">Data</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {historico.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-800">
                                            <td className="py-2">{item.nome}</td>
                                            <td className="py-2">{item.pontos.toLocaleString()}</td>
                                            <td className="py-2">{item.preco}</td>
                                            <td className="py-2">{item.data}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


