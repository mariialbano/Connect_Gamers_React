import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import FAQ from './pages/FAQ';
import Eventos from './pages/Eventos';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Pesquisa from './pages/Pesquisa';
import Rankings from './pages/Rankings';
import { useTheme } from './theme/ThemeContext';

function App() {
  const { theme } = useTheme();

  return (
    <Router>
      <div className={
        theme === "dark"
          ? "min-h-screen bg-gray-700 text-white flex flex-col"
          : "min-h-screen bg-white text-black flex flex-col" // <-- alterado para bg-white
      }>
        <Navbar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/pesquisa" element={<Pesquisa />} />
            <Route path="/rankings" element={<Rankings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
