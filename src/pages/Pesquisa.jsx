import React, { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';

const Pesquisa = () => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true" || false);
  const [hoverTitle, setHoverTitle] = useState(false);

  useEffect(() => {
    if (vlibrasActive && window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
    localStorage.setItem("vlibrasAtivo", vlibrasActive);
  }, [vlibrasActive]);

  return (
    <div className={
      theme === "dark"
        ? "min-h-screen flex flex-col text-white"
        : "min-h-screen flex flex-col text-black bg-white"
    }>    
      {/* Conteúdo principal */}
      <section className="pt-32 flex justify-center items-start px-4">
        <div
          className={
            theme === "dark"
              ? "bg-gray-800 text-white rounded-xl shadow-md p-8 w-full max-w-xl text-center"
              : "bg-[#d9dbe2] text-black rounded-xl shadow-md p-8 w-full max-w-xl text-center"
          }
        >
          <h2
            className="text-2xl font-bold mb-4 transition-colors"
            onMouseEnter={() => setHoverTitle(true)}
            onMouseLeave={() => setHoverTitle(false)}
            style={{ color: hoverTitle ? '#ff4fc9' : 'rgb(253, 77, 121)', cursor: 'pointer' }}
          >
            Pesquisa e Dados
          </h2>
          <p className={theme === "dark" ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>Jogos e Cooperação Social</p>
          <p className={theme === "dark" ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>
            Um estudo publicado na <em>PNAS</em> mostrou que jogos cooperativos aumentam a empatia e a cooperação entre os participantes.
          </p>
          <p className={theme === "dark" ? "text-[#bbb] mt-4 mb-2" : "text-gray-700 mt-4 mb-2"}>Videogames e Conexões Sociais</p>
          <p className={theme === "dark" ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>
            Uma pesquisa da <em>APA</em> descobriu que jogos multiplayer ajudam a fortalecer laços sociais.
          </p>
          <p className={theme === "dark" ? "text-[#bbb] mt-4 mb-2" : "text-gray-700 mt-4 mb-2"}>Jogos e Saúde Mental</p>
          <p className={theme === "dark" ? "text-[#bbb]" : "text-gray-700"}>
            Segundo a Oxford Internet Institute, jogos online podem reduzir o estresse e aumentar o bem-estar emocional.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pesquisa;
