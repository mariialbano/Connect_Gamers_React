import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { useTheme } from '../theme/ThemeContext';

export default function Dashboard() {
  const [squads, setSquads] = useState([]);
  const { theme } = useTheme(); // pegando o tema atual

  useEffect(() => {
    fetch("http://localhost:3001/squads")
      .then((res) => res.json())
      .then((data) => setSquads(data))
      .catch((err) => console.error("Erro ao carregar squads:", err));
  }, []);

  // 1️⃣ Gráfico de crescimento (squads por mês)
  const squadsPorMes = squads.reduce((acc, squad) => {
    const mes = new Date(squad.dataCadastro).toLocaleString("pt-BR", { month: "short" });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  const dataCrescimento = Object.keys(squadsPorMes).map((mes) => ({
    mes,
    squads: squadsPorMes[mes],
  }));

  // 2️⃣ Média de integrantes
  const mediaIntegrantes =
    squads.length > 0
      ? (squads.reduce((soma, s) => soma + s.integrantes.length, 0) / squads.length).toFixed(1)
      : 0;

  // 3️⃣ Distribuição por nível
  const distribuicaoNivel = squads.reduce((acc, squad) => {
    acc[squad.nivel] = (acc[squad.nivel] || 0) + 1;
    return acc;
  }, {});

  const totalSquads = squads.length;
  const dataNivel = Object.keys(distribuicaoNivel).map((nivel) => ({
    name: nivel,
    value: distribuicaoNivel[nivel],
    percent: ((distribuicaoNivel[nivel] / totalSquads) * 100).toFixed(1),
  }));

  const cores = ["#4F46E5", "#22C55E", "#FACC15", "#EC4899"];

  // 📌 Cores do tema
  const bgMain = theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900";
  const bgCard = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
  const tooltipBg = theme === "dark" ? "#1f2937" : "#f3f4f6";
  const tooltipColor = theme === "dark" ? "#fff" : "#111";

  return (
    <div className={`p-6 min-h-screen ${bgMain}`}>
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <span role="img" aria-label="chart">📊</span> Dashboard de Tendências
      </h1>

      {/* 🔹 Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className={`${bgCard} rounded-2xl p-5 text-center shadow-lg`}>
          <p className={theme === "dark" ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>Total de Squads</p>
          <p className="text-4xl font-bold text-indigo-400 mt-2">{squads.length}</p>
        </div>

        <div className={`${bgCard} rounded-2xl p-5 text-center shadow-lg`}>
          <p className={theme === "dark" ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>Média de Integrantes</p>
          <p className="text-4xl font-bold text-green-400 mt-2">{mediaIntegrantes}</p>
        </div>

        <div className={`${bgCard} rounded-2xl p-5 text-center shadow-lg`}>
          <p className={theme === "dark" ? "text-gray-300 text-sm" : "text-gray-600 text-sm"}>Níveis Ativos</p>
          <p className="text-4xl font-bold text-yellow-400 mt-2">{Object.keys(distribuicaoNivel).length}</p>
        </div>
      </div>

      {/* 🔹 Gráficos principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Crescimento */}
        <div className={`${bgCard} rounded-2xl p-5 shadow-lg`}>
          <h2 className={theme === "dark" ? "text-lg font-semibold mb-3 text-indigo-300" : "text-lg font-semibold mb-3 text-indigo-600"}>📈 Crescimento de Squads</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataCrescimento}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#444" : "#ccc"} />
              <XAxis dataKey="mes" stroke={theme === "dark" ? "#ccc" : "#555"} />
              <YAxis stroke={theme === "dark" ? "#ccc" : "#555"} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none" }}
                labelStyle={{ color: "#111" }}
                />
              <Legend />
              <Line type="monotone" dataKey="squads" stroke="#6366F1" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Níveis */}
        <div className={`${bgCard} rounded-2xl p-5 shadow-lg`}>
          <h2 className={theme === "dark" ? "text-lg font-semibold mb-3 text-green-300" : "text-lg font-semibold mb-3 text-green-600"}>🎮 Distribuição por Nível</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataNivel}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${percent}%`}
              >
                {dataNivel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "none" }}
                labelStyle={{ color: "#111" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🔹 Insights Extras */}
      <div className={`${bgCard} mt-10 p-6 rounded-2xl shadow-lg text-center`}>
        <h2 className={theme === "dark" ? "text-xl font-semibold mb-3 text-yellow-300" : "text-xl font-semibold mb-3 text-yellow-600"}>💡 Insights</h2>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          Atualmente existem <span className="text-indigo-400 font-semibold">{squads.length}</span> squads registrados.{" "}
          O nível mais comum é{" "}
          <span className="text-green-400 font-semibold">
            {Object.keys(distribuicaoNivel).reduce(
              (a, b) => (distribuicaoNivel[a] > distribuicaoNivel[b] ? a : b),
              ""
            )}
          </span>, indicando maior adesão de jogadores experientes.
        </p>
      </div>
    </div>
  );
}
