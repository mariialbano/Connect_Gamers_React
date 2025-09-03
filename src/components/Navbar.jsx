import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import Sidebar from './Sidebar';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
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
      {/* Navbar superior */}
      <header className="bg-[#d1d2d6] dark:bg-black text-black dark:text-white flex items-center justify-between px-6 py-3 shadow-md">
        {/* Lado esquerdo: menu */}
        <div className="w-32 flex justify-start">
          <button onClick={() => setMenuOpen(true)} className="text-pink-500 hover:text-pink-400">
            <Menu size={30} />
          </button>
        </div>

        {/* Logo centralizada */}
        <Link to="/" className="mx-auto">
          <img
            src={theme === "dark"
              ? "/assets/logo-connect-gamers-escuro.png"
              : "/assets/logo-connect-gamers-claro.png"}
            alt="Logo Connect Gamers"
            className="h-32 max-w-none"
          />
        </Link>

        {/* Lado direito: perfil/login */}
        <div className="w-32 flex justify-end relative items-center"
          onMouseEnter={() => usuarioLogado && setProfileDropdown(true)}
          onMouseLeave={() => usuarioLogado && setProfileDropdown(false)}
        >
          {/* Ícone de perfil */}
          <button
            onClick={handlePerfilClick}
            className="flex items-center text-pink-500 hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
            style={{ border: "none", background: "none" }}
          >
            <User size={30} />
          </button>
          {/* Botão de Entre ou Cadastre-se */}
          {!usuarioLogado && (
            <button
              className="ml-2 text-sm cursor-pointer relative group transition-colors text-pink-500 hover:text-pink-600 dark:text-white dark:hover:text-pink-500"
              onClick={() => navigate("/login")}
            >
              Entre ou Cadastre-se
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </button>
          )}
          {/* Seta e dropdown */}
          {usuarioLogado && (
            <>
              <button
                onClick={() => setProfileDropdown((open) => !open)}
                className="ml-1 flex items-center transition-colors text-pink-500 hover:text-pink-600 dark:text-white dark:hover:text-pink-400"
                style={{ border: "none", background: "none" }}
                aria-label="Abrir menu de conta"
              >
                <ChevronDown size={22} />
              </button>
              <div className="absolute right-0 top-full w-40 h-2 pointer-events-auto" />
              {profileDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50"
                  onMouseEnter={() => setProfileDropdown(true)}
                  onMouseLeave={() => setProfileDropdown(false)}
                >
                  <button
                    onClick={() => {
                      navigate("/perfil");
                      setProfileDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-100 dark:hover:bg-pink-500/30 text-gray-900 dark:text-white"
                  >
                    <User size={18} /> Conta
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setProfileDropdown(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 hover:rounded-lg hover:bg-pink-100 dark:hover:bg-pink-500/30 text-gray-900 dark:text-white"
                  >
                    <LogOut size={18} /> Sair
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </header>
      {/* Sidebar lateral */}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
