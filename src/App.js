import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import FAQ from './pages/FAQ';
import Jogos from './pages/Jogos';
import JogoDetalhe from './pages/JogoDetalhe';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Comunidade from './pages/Comunidade';
import Amigos from './pages/Amigos';
import { useTheme } from './theme/ThemeContext';

function App() {
  const { theme } = useTheme();

  // Rota protegida: só permite acesso se houver usuário logado em localStorage
  function RequireAuth({ children }) {
    const location = useLocation();
    const logged = typeof window !== 'undefined' && localStorage.getItem('usuarioLogado');
    if (!logged) {
      const dest = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?auth=1&from=${dest}`} replace />;
    }
    return children;
  }

  return (
    <Router>
      <div
        className={
          theme === "dark"
            ? "min-h-screen bg-gray-700 text-white flex flex-col"
            : "min-h-screen bg-white text-black flex flex-col"
        }
      >
        <Navbar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/inscreva-se" element={<RequireAuth><Cadastro /></RequireAuth>} />
            <Route path="/cadastro" element={<Navigate to="/inscreva-se" replace />} />
            <Route path="/faq" element={<RequireAuth><FAQ /></RequireAuth>} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/jogos/:gameId" element={<JogoDetalhe />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/comunidade" element={<RequireAuth><Comunidade /></RequireAuth>} />
            <Route path="/amigos" element={<RequireAuth><Amigos /></RequireAuth>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
