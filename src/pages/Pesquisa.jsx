import React, { useState, useEffect } from 'react';

const Pesquisa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("siteTheme") === "dark" || false);
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true" || false);
  const [hoverTitle, setHoverTitle] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkTheme);
    document.body.classList.toggle("light-theme", !darkTheme);
    localStorage.setItem("siteTheme", darkTheme ? "dark" : "light");
  }, [darkTheme]);

  useEffect(() => {
    if (vlibrasActive && window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
    localStorage.setItem("vlibrasAtivo", vlibrasActive);
  }, [vlibrasActive]);

  useEffect(() => {
    console.log("Script da página de Pesquisa e Dados carregado com sucesso.");
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleThemeToggle = () => {
    setDarkTheme(!darkTheme);
  };

  const handleVlibrasToggle = () => {
    setVlibrasActive(!vlibrasActive);
  };

  return (
    <div className={`mb-32 flex flex-col ${darkTheme ? 'text-white bg-black' : 'text-black'}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      ></div>

      {/* Conteúdo principal */}
      <section className="pt-32 pb-16 flex justify-center items-start px-4">
        <div
          className={
            darkTheme
              ? "bg-[#1a1a1a] text-white rounded-xl shadow-md p-8 w-full max-w-xl text-center"
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
          <p className={darkTheme ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>Jogos e Cooperação Social</p>
          <p className={darkTheme ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>
            Um estudo publicado na <em>PNAS</em> mostrou que jogos cooperativos aumentam a empatia e a cooperação entre os participantes.
          </p>
          <p className={darkTheme ? "text-[#bbb] mt-4 mb-2" : "text-gray-700 mt-4 mb-2"}>Videogames e Conexões Sociais</p>
          <p className={darkTheme ? "text-[#bbb] mb-2" : "text-gray-700 mb-2"}>
            Uma pesquisa da <em>APA</em> descobriu que jogos multiplayer ajudam a fortalecer laços sociais.
          </p>
          <p className={darkTheme ? "text-[#bbb] mt-4 mb-2" : "text-gray-700 mt-4 mb-2"}>Jogos e Saúde Mental</p>
          <p className={darkTheme ? "text-[#bbb]" : "text-gray-700"}>
            Segundo a Oxford Internet Institute, jogos online podem reduzir o estresse e aumentar o bem-estar emocional.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Pesquisa;
