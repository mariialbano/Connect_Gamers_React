import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useTheme } from '../theme/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");
    navigate("/login");
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-lightfooterDark text-black"
        } transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50 flex flex-col justify-between`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div
            className="p-5 text-xl font-bold border-b border-gray-700 cursor-pointer select-none"
            onClick={onClose}
          >
            Connect Gamers
          </div>
          <nav className="flex flex-col gap-4 p-5">
            <Link to="/" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                Home
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/eventos" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                Eventos
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/cadastro" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                Inscreva-se
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/rankings" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                Rankings
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/pesquisa" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                Saiba mais
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/faq" onClick={onClose} className="relative group transition-colors hover:text-pink-500">
              <span className="relative">
                FAQ
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          </nav>
        </div>

        {/* Configurações e sair */}
        <div className="p-5 border-t border-gray-700">
          <p className="text-lg font-semibold mb-3">Configurações</p>

          <div className="flex items-center justify-between mb-4">
            <span>{theme === "dark" ? "Tema Escuro" : "Tema Claro"}</span>
            <label className="relative inline-block w-12 h-6 cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={theme === "light"}
                onChange={toggleTheme}
              />
              <div className="w-full h-full bg-gray-400 peer-checked:bg-pink-500 rounded-full transition duration-300"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
            </label>
          </div>

          {usuarioLogado && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:text-pink-500 transition"
            >
              <FiLogOut />
              Sair
            </button>
          )}
        </div>
      </div>
    </>
  );
}