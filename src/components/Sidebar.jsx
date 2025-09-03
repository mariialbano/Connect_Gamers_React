import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';

export default function Sidebar({ isOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-lightfooterDark dark:bg-gray-900 text-black dark:text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-50 flex flex-col justify-between`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <Link
            to="/"
            onClick={onClose}
            className="p-5 text-xl font-bold border-b border-gray-700 dark:border-gray-700 cursor-pointer select-none w-full text-left block"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
          >
            Connect Gamers
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-4 p-5">
            <Link to="/" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                Home
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/eventos" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                Eventos
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/cadastro" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                Inscreva-se
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/rankings" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                Rankings
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/pesquisa" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                Saiba mais
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
            <Link to="/faq" onClick={onClose} className="relative group transition-colors hover:text-pink-500 dark:hover:text-pink-400">
              <span className="relative">
                FAQ
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          </nav>
        </div>

        {/* Configurações */}
        <div className="p-5 border-t border-gray-700 dark:border-gray-700">
          <p className="text-lg font-semibold mb-3 text-black dark:text-white">Configurações</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-black dark:text-white">{theme === "dark" ? "Tema Escuro" : "Tema Claro"}</span>
            <button
              type="button"
              tabIndex={0}
              aria-label="Alternar tema"
              onClick={toggleTheme}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleTheme();
                }
              }}
              className={`relative inline-block w-12 h-6 rounded-full transition duration-300 ${theme === 'light' ? 'bg-pink-500' : 'bg-gray-400'}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${theme === 'light' ? 'translate-x-6' : ''}`}
                aria-hidden="true"
              ></span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
