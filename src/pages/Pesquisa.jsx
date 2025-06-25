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
    <div className={`min-h-screen flex flex-col ${darkTheme ? 'text-white bg-black' : 'text-black bg-white'}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-black z-50 transition-all duration-300 ${sidebarOpen ? 'w-[250px]' : 'w-0 overflow-hidden'}`}>
        <div className="pt-16 px-4 text-white text-lg">
          <a href="/" className="block py-2">Home</a>
          <a href="/eventos" className="block py-2">Jogos e Eventos</a>
          <a href="/cadastro" className="block py-2">Inscreva-se</a>
          <a href="/rankings" className="block py-2">Rankings</a>
          <a href="/FAQ" className="block py-2">FAQ</a>
          <a href="/pesquisa" className="block py-2">Saiba mais</a>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Tema {darkTheme ? 'Escuro' : 'Claro'}</span>
              <label className="switch">
                <input type="checkbox" checked={darkTheme} onChange={handleThemeToggle} />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white">Libras</span>
              <label className="switch">
                <input type="checkbox" checked={vlibrasActive} onChange={handleVlibrasToggle} />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-black text-white flex justify-between items-center px-6 py-3 fixed top-0 w-full z-50">
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar}>
            <img src="/assets/IMAGENS/lista.png" alt="Menu" className="w-10" />
          </button>
          <a href="/">
            <img
              src={darkTheme ? "/assets/IMAGENS/Connect_Gamers_logo_OFICIAL-removebg-preview.png" : "/assets/IMAGENS/logo - tema claro.png"}
              alt="logo"
              className="w-[190px]"
            />
          </a>
        </div>
        <a href="/login">
          <img
            src={darkTheme ? "/assets/IMAGENS/perfil.png" : "/assets/IMAGENS/perfil_preto.png"}
            alt="Perfil"
            className="w-10"
          />
        </a>
      </nav>

      {/* Conteúdo principal */}
      <section className="pt-32 pb-16 flex justify-center items-start px-4">
        <div className="bg-[#1a1a1a] text-white rounded-xl shadow-md p-8 w-full max-w-xl text-center">
          <h2
            className="text-2xl font-bold mb-4 transition-colors"
            onMouseEnter={() => setHoverTitle(true)}
            onMouseLeave={() => setHoverTitle(false)}
            style={{ color: hoverTitle ? '#ff4fc9' : 'rgb(253, 77, 121)', cursor: 'pointer' }}
          >
            Pesquisa e Dados
          </h2>
          <p className="text-[#bbb] mb-2">Jogos e Cooperação Social</p>
          <p className="text-[#bbb] mb-2">
            Um estudo publicado na <em>PNAS</em> mostrou que jogos cooperativos aumentam a empatia e a cooperação entre os participantes.
          </p>
          <p className="text-[#bbb] mt-4 mb-2">Videogames e Conexões Sociais</p>
          <p className="text-[#bbb] mb-2">
            Uma pesquisa da <em>APA</em> descobriu que jogos multiplayer ajudam a fortalecer laços sociais.
          </p>
          <p className="text-[#bbb] mt-4 mb-2">Jogos e Saúde Mental</p>
          <p className="text-[#bbb]">
            Segundo a Oxford Internet Institute, jogos online podem reduzir o estresse e aumentar o bem-estar emocional.
          </p>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="bg-[#1a1a1a] text-white text-center text-sm py-4 border-t-2 border-[#fd4d79] shadow-inner">
        <p>© 2025 Connect Gamers. Todos os direitos reservados.</p>
        <p>Desenvolvido por: Ana Gonçalves, Jessica Brito, Mariana Albano, Neemias Silva, Vinícius Gonzales.</p>
      </footer>

      {/* VLibras Container */}
      {vlibrasActive && (
        <div id="vlibras">
          <div vw className="enabled">
            <div vw-access-button className="active"></div>
            <div vw-plugin-wrapper>
              <div className="vw-plugin-top-wrapper"></div>
            </div>
          </div>
        </div>
      )}

      {/* Estilos do switch */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 25px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 25px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 19px;
          width: 19px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: rgb(253, 77, 121);
        }
        input:checked + .slider:before {
          transform: translateX(24px);
        }
      `}</style>
    </div>
  );
};

export default Pesquisa;
