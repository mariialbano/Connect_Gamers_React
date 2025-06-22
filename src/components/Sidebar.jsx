import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const usuarioLogado = localStorage.getItem("usuarioLogado");

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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50 flex flex-col justify-between`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="p-5 text-xl font-bold border-b border-gray-700">Connect Gamers</div>
          <nav className="flex flex-col gap-4 p-5">
            <Link to="/" onClick={onClose}>Home</Link>
            <Link to="/eventos" onClick={onClose}>Eventos</Link>
            <Link to="/cadastro" onClick={onClose}>Inscreva-se</Link>
            <Link to="/rankings" onClick={onClose}>Rankings</Link>
            <Link to="/pesquisa" onClick={onClose}>Saiba mais</Link>
            <Link to="/faq" onClick={onClose}>FAQ</Link>
          </nav>
        </div>

        {/* Configurações e sair */}
        <div className="p-5 border-t border-gray-700">
          <p className="text-lg font-semibold mb-3">Configurações</p>

          <div className="flex items-center justify-between mb-4">
            <span>Tema</span>
            <label className="relative inline-block w-12 h-6">
              <input type="checkbox" className="sr-only peer" />
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
