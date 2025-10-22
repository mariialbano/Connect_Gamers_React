import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Users, LogOut, ChevronDown, LayoutDashboard, Coins, Zap } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export default function Navbar() {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [hoverChevron, setHoverChevron] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(false);
  const [showPointsPreview, setShowPointsPreview] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme, fontSize, changeFontSize } = useTheme();
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const usuarioNivelAcesso = (localStorage.getItem('usuarioNivelAcesso') || '').toLowerCase();
  const isAdmin = usuarioNivelAcesso === 'admin';

  useEffect(() => {
    setProfileDropdown(hoverChevron || hoverMenu);
  }, [hoverChevron, hoverMenu]);

  const handlePerfilClick = () => {
    if (usuarioLogado) {
      navigate("/perfil");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNivelAcesso');
    localStorage.removeItem('isAdmin');
    navigate("/login");
  };

  return (
    <>
      {/* Navbar */}
      <header className="bg-[#d1d2d6] dark:bg-black text-black dark:text-white flex items-center justify-between px-6 py-1 shadow-md">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-8">
          <img
            src={theme === "dark"
              ? "/assets/logo-connect-gamers-escuro.png"
              : "/assets/logo-connect-gamers-claro.png"}
            alt="Logo Connect Gamers"
            className="h-32 max-w-none"
          />
        </Link>
        {/* Navlinks e perfil/login */}
        <div className="flex flex-1 items-center justify-between">
          <div className="flex-1 flex justify-end">
            <nav className="flex gap-6 items-center text-lg font-bold mr-16">
              <Link to="/" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Home
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/jogos" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Jogos
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/inscreva-se" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Inscreva-se
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/resgates" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Resgates
                   <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link
                to={usuarioLogado ? "/comunidade" : "/login?auth=1&from=%2Fcomunidade"}
                className={`relative group transition-colors font-medium px-1 rounded-md hover:text-pink-800 dark:hover:text-pink-400`}
                title={usuarioLogado ? 'Comunidade' : 'Faça login para acessar'}
              >
                <span className="relative">
                  Comunidade
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>

              {/* POINTS PREVIEW */}
              <div 
                className="relative"
                onMouseEnter={() => setShowPointsPreview(true)}
                onMouseLeave={() => setShowPointsPreview(false)}
              >
                <button className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md flex items-center gap-1">
                  <Coins size={18} />
                  <span className="relative">
                    Pontos
                    <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </button>

                {showPointsPreview && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-50">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-pink-400 rounded p-1">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Seus Pontos</h3>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Saldo</span>
                        <Zap className="w-3 h-3 text-yellow-500" />
                      </div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        1.500
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ≈ R$ 15,00
                      </div>
                    </div>

                    <Link 
                      to="/pontos"
                      className="block w-full bg-pink-500 hover:bg-pink-600 text-white text-center py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => setShowPointsPreview(false)}
                    >
                      Comprar Pontos
                    </Link>
                  </div>
                )}
              </div>
              {/* FIM DO POINTS PREVIEW */}

              <Link to="/faq" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  FAQ
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/esg" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  ESG
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
            </nav>
          </div>
          {/* Amigos */}
          <button
            onClick={() => usuarioLogado ? navigate('/amigos') : navigate('/login?auth=1&from=%2Famigos')}
            className={`mr-3 flex items-center text-black dark:text-white hover:text-pink-600 dark:hover:text-pink-600`}
            style={{ border: 'none', background: 'none' }}
            aria-label={usuarioLogado ? 'Ir para amigos' : 'Faça login para acessar amigos'}
            title={usuarioLogado ? 'Amigos' : 'Faça login para acessar'}
          >
            <Users size={30} />
          </button>
          {/* Perfil/Login */}
          <div className="flex justify-end relative items-center min-w-[48px]">
            {/* Perfil */}
            <div className="relative flex items-center cursor-pointer">
              <button
                onClick={handlePerfilClick}
                className="flex items-center text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-600"
                style={{ border: "none", background: "none" }}
                aria-label={usuarioLogado ? 'Ir para perfil' : 'Ir para login'}
              >
                <User size={30} />
              </button>
              {/* Seta e Dropdown */}
              <div className="relative inline-flex items-center">
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown((open) => !open)}
                    onMouseEnter={() => setHoverChevron(true)}
                    onMouseLeave={() => setHoverChevron(false)}
                    className="ml-1 flex items-center transition-colors text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-600"
                    style={{ border: "none", background: "none" }}
                    aria-label="Abrir menu de conta"
                    aria-expanded={profileDropdown}
                  >
                    <ChevronDown size={22} />
                  </button>
                  {profileDropdown && (
                    <div
                      className="absolute left-0 top-full w-full h-3"
                      onMouseEnter={() => setHoverMenu(true)}
                      onMouseLeave={() => setHoverMenu(false)}
                    />
                  )}
                </div>
                {profileDropdown && (
                  <div
                    className="profile-dropdown absolute right-0 top-full mt-3 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setHoverMenu(true)}
                    onMouseLeave={() => setHoverMenu(false)}
                  >
                  {usuarioLogado && (
                    <>
                      <button
                        onClick={() => {
                          navigate("/perfil");
                          setProfileDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                      >
                        <User size={18} /> Conta
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/dashboard');
                            setProfileDropdown(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                        >
                          <LayoutDashboard size={18} /> Dashboard
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                    aria-label="Alternar tema claro/escuro"
                  >
                    <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
                    <span className="ml-auto">
                      <span className={`relative inline-block w-10 h-5 align-middle select-none transition duration-200`}>
                        <span
                          className={`absolute left-0 top-0 w-10 h-5 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-pink-600' : 'bg-pink-600'}`}
                        ></span>
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : ''}`}
                        ></span>
                      </span>
                    </span>
                  </button>
                  {/* Controle de tamanho da fonte */}
                  <div className="px-4 pt-2 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2 font-semibold">Tamanho da Fonte</p>
                    <div className="flex gap-2">
                      {[
                        { key: 'small', label: 'Pequena', short: 'A-' },
                        { key: 'base', label: 'Normal', short: 'A' },
                        { key: 'large', label: 'Grande', short: 'A+' },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => changeFontSize(opt.key)}
                          className={`flex-1 text-xs px-2 py-1 rounded-md border transition font-semibold
                            ${fontSize === opt.key
                              ? 'bg-pink-600 text-white border-pink-600 dark:bg-pink-600 dark:border-pink-600'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-pink-100 dark:hover:bg-gray-600'}`}
                          aria-pressed={fontSize === opt.key}
                          aria-label={`Fonte ${opt.label}`}
                        >
                          {opt.short}
                        </button>
                      ))}
                    </div>
                  </div>
                  {usuarioLogado && (
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                    >
                      <LogOut size={18} /> Sair
                    </button>
                  )}
                  </div>
                )}
              </div>
            </div>
            {/* Entre ou Cadastre-se */}
            {!usuarioLogado && (
              <button
                className="ml-2 text-sm cursor-pointer relative group transition-colors text-pink-800 hover:text-pink-900 dark:text-white dark:hover:text-pink-400"
                onClick={() => navigate("/login")}
              >
                Entre ou Cadastre-se
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

