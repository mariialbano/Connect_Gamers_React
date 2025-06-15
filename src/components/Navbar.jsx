import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, User } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar superior */}
      <header className="bg-black text-white flex items-center justify-between px-6 py-3 shadow-md">
        {/* Ícone Hamburguer */}
        <button onClick={() => setMenuOpen(true)} className="text-pink-500 hover:text-pink-400 ml-10">
          <Menu size={30} />
        </button>

        {/* Logo centralizada */}
        <Link to="/">
            <div className="flex justify-center flex-grow">
                <img
                    src="/assets/logo-connect-gamers-escuro.png"
                    alt="Logo Connect Gamers"
                    className="h-32 max-w-none"
                />
            </div>
        </Link>
        

        {/* Ícone Perfil */}
        <Link to="/login" className="text-pink-500 hover:text-pink-400 mr-10">
          <User size={30} />
        </Link>
      </header>

      {/* Sidebar lateral */}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
