import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, User } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handlePerfilClick = () => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
      navigate("/perfil");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Navbar superior */}
      <header className={
        theme === "dark"
          ? "bg-black text-white flex items-center justify-between px-6 py-3 shadow-md"
          : "bg-[#d1d2d6] text-black flex items-center justify-between px-6 py-3 shadow-md"
      }>
        {/* Ícone Hamburguer */}
        <button onClick={() => setMenuOpen(true)} className="text-pink-500 hover:text-pink-400 ml-10">
          <Menu size={30} />
        </button>

        {/* Logo centralizada */}
        <Link to="/">
          <div className="flex justify-center flex-grow">
            <img
              src={theme === "dark"
                ? "/assets/logo-connect-gamers-escuro.png"
                : "/assets/logo-connect-gamers-claro.png"}
              alt="Logo Connect Gamers"
              className="h-32 max-w-none"
            />
          </div>
        </Link>

        {/* Ícone Perfil */}
        <button onClick={handlePerfilClick} className="text-pink-500 hover:text-pink-400 mr-10">
          <User size={30} />
        </button>
      </header>

      {/* Sidebar lateral */}
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
