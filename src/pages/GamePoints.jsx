import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

export default function GamePoints() {
  // Padrão: 1500 pontos caso não haja usuarioLogado
  const [userPoints, setUserPoints] = useState(0);
  const [form, setForm] = useState({
    fullName: "",
    cpf: "",
    phone: "",
    pixType: "",
    pixKey: "",
    withdrawAmount: ""
  });

  // Calculadora: input de pontos para converter em R$
  const [calcPoints, setCalcPoints] = useState(0);
  const pointsToReal = (pts) => (Number(pts) / 100).toFixed(2); // 100 pontos = R$1

  useEffect(() => {
    // Tenta ler do localStorage um saldo em pontos salvo pelo site
    try {
      const saved = typeof window !== 'undefined' && localStorage.getItem('usuarioPontos');
      if (saved) {
        setUserPoints(Number(saved));
      } else {
        // fallback: valor exemplo
        setUserPoints(1500);
      }
    } catch (e) {
      setUserPoints(1500);
    }
  }, []);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.id]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Demonstração: simula processamento
    alert("Solicitação Recebida! (DEMO)");
    setForm({
      fullName: "",
      cpf: "",
      phone: "",
      pixType: "",
      pixKey: "",
      withdrawAmount: ""
    });
  }

  return (
    <main className="min-h-scree">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formulário principal ocupa 2 colunas em telas grandes */}
          <section className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <span className="text-2xl mr-3">💳</span>
                  Solicitar Saque
                </h2>
                <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-semibold">
                  DEMO - Não Funcional
                </div>
              </div>
              <form id="withdrawForm" className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nome Completo *</label>
                    <input type="text" id="fullName" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Ex: João Silva Santos" required value={form.fullName} onChange={handleFormChange} />
                  </div>
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">CPF *</label>
                    <input type="text" id="cpf" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="000.000.000-00" maxLength={14} required value={form.cpf} onChange={handleFormChange} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Número de Telefone *</label>
                    <input type="tel" id="phone" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="(11) 99999-9999" maxLength={15} required value={form.phone} onChange={handleFormChange} />
                  </div>
                  <div>
                    <label htmlFor="pixType" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Tipo de Chave PIX *</label>
                    <select id="pixType" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" required value={form.pixType} onChange={handleFormChange}>
                      <option value="">Selecione o tipo</option>
                      <option value="cpf">CPF</option>
                      <option value="phone">Telefone</option>
                      <option value="email">E-mail</option>
                      <option value="random">Chave Aleatória</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Chave PIX *</label>
                  <input type="text" id="pixKey" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Digite sua chave PIX" required value={form.pixKey} onChange={handleFormChange} />
                </div>
                <div>
                  <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Valor do Saque (R$) *</label>
                  <input type="number" id="withdrawAmount" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="R$ 0,00" min="1" max="157.50" step="0.01" required value={form.withdrawAmount} onChange={handleFormChange} />
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Valor mínimo: R$ 1,00 | Máximo disponível: R$ 157,50
                  </div>
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-pink-400 mr-3 mt-1">ℹ️</div>
                    <div className="text-sm text-pink-800">
                      <strong>Importante:</strong> Esta é uma demonstração. Em um sistema real, essas informações seriam processadas com segurança e criptografia. O saque seria processado em até 3 dias úteis.
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center">
                  <span className="mr-2">💸</span>
                  Solicitar Saque (DEMO)
                </button>
              </form>
            </div>
          </section>

          {/* Painel lateral com saldo e calculadora */}
          <aside className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow relative">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Seu Saldo</h3>
              <Link to="/pontos" className="text-sm bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white px-3 py-1 rounded-full shadow-sm">Voltar aos Pontos</Link>
            </div>
            <div className="mb-4">
              <div className="text-3xl font-bold text-pink-800">{userPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">pontos • ≈ R$ {pointsToReal(userPoints)}</div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Calculadora de Pontos</h4>
              <label className="block text-xs text-gray-500 mb-1">Pontos</label>
              <input type="number" value={calcPoints} onChange={(e) => setCalcPoints(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Equivalente em R$: <span className="font-medium">R$ {pointsToReal(calcPoints || 0)}</span></div>

              <div className="mt-4">
                <button onClick={() => setCalcPoints(userPoints)} className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white py-2 rounded-md">Usar todo meu saldo</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
