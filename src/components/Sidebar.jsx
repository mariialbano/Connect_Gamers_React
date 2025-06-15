import { Link } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-50 flex flex-col justify-between`}>
      
      {/* Topo e navegação */}
      <div>
        <div className="p-5 text-xl font-bold border-b border-gray-700">Connect Gamers</div>
        <nav className="flex flex-col gap-4 p-5">
          <Link to="/" onClick={onClose}>Home</Link>
          <Link to="/eventos" onClick={onClose}>Eventos</Link>
          <Link to="/cadastro" onClick={onClose}>Inscreva-se</Link>
          <Link to="/rankings" onClick={onClose}>Rankings</Link>
          <Link to="/pesquisa" onClick={onClose}>Saiba mais</Link>
          <Link to="/faq" onClick={onClose}>FAQ</Link>
          <Link to="/perfil" onClick={onClose}>Perfil</Link>
        </nav>
      </div>

      {/* Configurações */}
      <div className="p-5 border-t border-gray-700">
        <p className="text-lg font-semibold mb-3">Configurações</p>

        {/* Libras */}
        <div className="flex items-center justify-between mb-4">
          <span>Libras</span>
          <label className="relative inline-block w-12 h-6">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-full h-full bg-gray-400 peer-checked:bg-pink-500 rounded-full transition duration-300"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
          </label>
        </div>

        {/* Tema */}
        <div className="flex items-center justify-between">
          <span>Tema</span>
          <label className="relative inline-block w-12 h-6">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-full h-full bg-gray-400 peer-checked:bg-pink-500 rounded-full transition duration-300"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
