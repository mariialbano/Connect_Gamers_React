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
import Dashboard from './pages/Dashboard';
import ESG from './pages/ESG';
import Pontos from './pages/Pontos';
import { useTheme } from './theme/ThemeContext';

function App() {
  const { theme } = useTheme();

  // Rota protegida: só permite acesso se houver usuário logado
  function RequireAuth({ children }) {
    const location = useLocation();
    const logged = typeof window !== 'undefined' && localStorage.getItem('usuarioLogado');
    if (!logged) {
      const dest = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?auth=1&from=${dest}`} replace />;
    }
    return children;
  }

  function RequireAdmin({ children }) {
    const location = useLocation();
    const logged = typeof window !== 'undefined' && localStorage.getItem('usuarioLogado');
    const nivelAcesso = typeof window !== 'undefined' ? (localStorage.getItem('usuarioNivelAcesso') || '').toLowerCase() : null;
    const dest = encodeURIComponent(location.pathname + location.search);

    if (!logged) {
      return <Navigate to={`/login?auth=1&admin=1&from=${dest}`} replace />;
    }

    if (nivelAcesso !== 'admin') {
      return <Navigate to="/home" replace state={{ denied: 'admin' }} />;
    }

    return children;
  }

  function RedirectCadastro() {
    const location = useLocation();
    return <Navigate to={`/inscreva-se${location.search || ''}`} replace />;
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
            <Route path="/cadastro" element={<RedirectCadastro />} />
            <Route path="/faq" element={<RequireAuth><FAQ /></RequireAuth>} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/jogos/:gameId" element={<JogoDetalhe />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/comunidade" element={<RequireAuth><Comunidade /></RequireAuth>} />
            <Route path="/amigos" element={<RequireAuth><Amigos /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
            <Route path="/esg" element={<ESG />} />
            <Route path="/pontos" element={<Pontos />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
