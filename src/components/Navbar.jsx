import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white px-4 py-3 flex gap-6">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/pesquisa" className="hover:underline">Pesquisa</Link>
      <Link to="/faq" className="hover:underline">FAQ</Link>
      <Link to="/cadastro" className="hover:underline">Cadastro</Link>
      <Link to="/eventos" className="hover:underline">Eventos</Link>
      <Link to="/login" className="hover:underline">Login</Link>
      <Link to="/perfil" className="hover:underline">Perfil</Link>
      <Link to="/rankings" className="hover:underline">Rankings</Link>
    </nav>
  );
}
