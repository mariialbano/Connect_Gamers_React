import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Users, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
export default function Navbar() {
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme, fontSize, changeFontSize } = useTheme();
  const usuarioLogado = localStorage.getItem("usuarioLogado");

  const handlePerfilClick = () => {
    if (usuarioLogado) {
      navigate("/perfil");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
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
              <Link to="/cadastro" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Inscreva-se
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/faq" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  FAQ
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
              <Link to="/comunidade" className="relative group transition-colors hover:text-pink-800 dark:hover:text-pink-400 font-medium px-1 rounded-md">
                <span className="relative">
                  Comunidade
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-800 dark:bg-pink-400 transition-all duration-300 group-hover:w-full"></span>
                </span>
              </Link>
            </nav>
          </div>
          {/* Amigos */}
          <button
            onClick={() => navigate('/amigos')}
            className="mr-3 flex items-center text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-600"
            style={{ border: 'none', background: 'none' }}
            aria-label="Ir para amigos"
          >
            <Users size={30} />
          </button>
          {/* Perfil/Login */}
          <div
            className="flex justify-end relative items-center min-w-[48px] cursor-pointer"
            onMouseEnter={() => usuarioLogado && setProfileDropdown(true)}
            onMouseLeave={() => usuarioLogado && setProfileDropdown(false)}
          >
            {/* Perfil */}
            <button
              onClick={handlePerfilClick}
              className="flex items-center text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-600"
              style={{ border: "none", background: "none" }}
              aria-label={usuarioLogado ? 'Ir para perfil' : 'Ir para login'}
            >
              <User size={30} />
            </button>
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
            {/* Seta e Dropdown */}
            {usuarioLogado && (
              <>
                <button
                  onClick={() => setProfileDropdown((open) => !open)}
                  className="ml-1 flex items-center transition-colors text-black hover:text-pink-600 dark:text-white dark:hover:text-pink-600"
                  style={{ border: "none", background: "none" }}
                  aria-label="Abrir menu de conta"
                >
                  <ChevronDown size={22} />
                </button>
                <div className="absolute right-0 top-full w-40 h-2 pointer-events-auto" />
                {profileDropdown && (
                  <div
                    className="profile-dropdown absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50"
                    onMouseEnter={() => setProfileDropdown(true)}
                    onMouseLeave={() => setProfileDropdown(false)}
                  >
                    <button
                      onClick={() => {
                        navigate("/perfil");
                        setProfileDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                    >
                      <User size={18} /> Conta
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                      aria-label="Alternar tema claro/escuro"
                    >
                      <span>{theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}</span>
                      <span className="ml-auto">
                        <span className={`relative inline-block w-10 h-5 align-middle select-none transition duration-200`}
                        >
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
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-600/30 dark:hover:bg-pink-600/30 text-gray-900 dark:text-white"
                    >
                      <LogOut size={18} /> Sair
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
