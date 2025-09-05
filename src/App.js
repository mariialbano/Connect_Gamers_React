import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import FAQ from './pages/FAQ';
import Jogos from './pages/Eventos'; // Página de listagem de jogos
import JogoDetalhe from './pages/JogoDetalhe';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Comunidade from './pages/Comunidade';
import Amigos from './pages/Amigos';
import { useTheme } from './theme/ThemeContext';

function App() {
  const { theme } = useTheme();

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
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/jogos" element={<Jogos />} />
            <Route path="/jogos/:gameId" element={<JogoDetalhe />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/comunidade" element={<Comunidade />} />
            <Route path="/amigos" element={<Amigos />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
