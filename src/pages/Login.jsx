import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getItem, postItem } from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LayoutWrapper from "../components/LayoutWrapper";
import { Card, Button, Badge } from "../components/ui";

export default function Login() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [seguranca, setSeguranca] = useState(false);
  const [compartilharDados, setCompartilharDados] = useState(false);
  const [usuariosExistentes, setUsuariosExistentes] = useState([]);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const authRequired = params.get('auth') === '1';
  const adminRequired = params.get('admin') === '1';
  const from = params.get('from');

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getItem("usuarios");
        setUsuariosExistentes(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };

    fetchUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario || !senha || (modo === "cadastro" && (!seguranca || !compartilharDados || !nome))) {
      alert("Preencha todos os campos e, no cadastro, aceite os termos.");
      return;
    }

    const usuarioBusca = usuario.trim();
    const usuarioExiste = usuariosExistentes.find((u) => (u.usuario || '').toLowerCase() === usuarioBusca.toLowerCase());

    if (modo === "cadastro") {
      if (usuarioExiste) {
        alert("Este nome de usuário já está cadastrado!");
        return;
      }

      try {
        const novo = await postItem("usuarios", { nome, usuario: usuarioBusca, senha });
        const nivelAcesso = (novo.cargo || novo.nivelAcesso || 'user').toLowerCase();
        localStorage.setItem("usuarioLogado", novo.usuario || usuarioBusca);
        localStorage.setItem("usuarioId", novo.id);
        localStorage.setItem('usuarioNivelAcesso', nivelAcesso);
        localStorage.setItem('isAdmin', String(nivelAcesso === 'admin'));
        setUsuariosExistentes(prev => [...prev, { ...novo, usuario: novo.usuario || usuarioBusca }]);
        alert("Cadastro realizado com sucesso!");
        navigate(from || "/perfil");
      } catch (error) {
        alert("Erro ao cadastrar usuário.");
      }
    }

    if (modo === "login") {
      try {
        console.log('🔐 Tentando login com:', { usuario: usuarioBusca, senhaLength: senha.length });
        // Chama a rota de login no backend que faz a verificação com bcrypt
        const logged = await postItem('usuarios/login', { usuario: usuarioBusca, senha });
        console.log('✅ Login bem-sucedido:', logged);
        // Se retornou OK, salva info e navega
        const nivelAcesso = (logged.cargo || logged.nivelAcesso || 'user').toLowerCase();
        localStorage.setItem('usuarioLogado', logged.usuario || usuarioBusca);
        localStorage.setItem('usuarioId', logged.id);
        localStorage.setItem('usuarioNivelAcesso', nivelAcesso);
        localStorage.setItem('isAdmin', String(nivelAcesso === 'admin'));
        alert('Login realizado com sucesso!');
        navigate(from || '/perfil');
      } catch (err) {
        console.error('❌ Erro no login:', err);
        alert('Usuário ou senha inválidos.');
      }
    }
  };

  const handleEsqueciSenha = () => {
    const usuarioEncontrado = usuariosExistentes.find((u) => u.usuario === usuario);
    if (!usuario) {
      alert('Digite seu nome de usuário para recuperar a senha.');
    } else if (!usuarioEncontrado) {
      alert('Usuário não encontrado.');
    } else {
      alert('Para recuperar/resetar sua senha, cadastre-se novamente com outro usuário ou entre em contato com o suporte.');
    }
  };

  return (
    <LayoutWrapper variant="login" className="flex items-center justify-center py-10 px-4">
      <Card variant="glass" className="p-8 w-full max-w-md text-neutral-900 dark:text-neutral-100">
        {/* Header com branding */}
        <div className="text-center mb-8">
          <Badge variant="primary" size="lg" className="mb-4">
            🎮 Connect Gamers
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            {modo === "login" ? "Bem-vindo de volta!" : "Junte-se à comunidade!"}
          </h1>
          <p className="text-white/80">
            {modo === "login" ? "Entre na sua conta para continuar" : "Crie sua conta e comece a jogar"}
          </p>
        </div>

        {authRequired && (
          <Badge variant="warning" size="sm" className="mb-6 w-full justify-center">
            Faça login para acessar esta página
          </Badge>
        )}
        {adminRequired && (
          <Badge variant="danger" size="sm" className="mb-6 w-full justify-center">
            Apenas administradores podem acessar esta área
          </Badge>
        )}
        {/* Tabs de navegação */}
        <div className="flex bg-white/10 dark:bg-neutral-800/30 rounded-lg p-1 mb-6">
          <button
            onClick={() => setModo("login")}
            className={`flex-1 px-4 py-2 font-semibold rounded-md transition-all ${
              modo === "login" 
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setModo("cadastro")}
            className={`flex-1 px-4 py-2 font-semibold rounded-md transition-all ${
              modo === "cadastro" 
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {modo === "cadastro" && (
            <div>
              <label htmlFor="nome" className="block mb-1 text-neutral-900 dark:text-neutral-100">Nome</label>
              <input
                type="text"
                id="nome"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label htmlFor="usuario" className="block mb-1 text-neutral-900 dark:text-neutral-100">Nome de usuário</label>
            <input
              type="text"
              id="usuario"
              placeholder="Digite seu nome de usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-neutral-900 dark:text-neutral-100">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                id="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}"
                title="A senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos"
                required
                className="w-full px-4 py-2 pr-12 rounded-md bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(v => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small className="text-neutral-600 dark:text-neutral-400">
              Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos
            </small>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="securityAwareness"
              checked={seguranca}
              onChange={(e) => setSeguranca(e.target.checked)}
              required
              className="accent-primary-600 bg-white border-primary-500 dark:accent-primary-500 dark:bg-neutral-800 dark:border-primary-600"
            />
            <label htmlFor="securityAwareness" className="text-sm text-neutral-900 dark:text-neutral-100">
              Estou ciente das práticas de segurança do site
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="dataSharing"
              checked={compartilharDados}
              onChange={(e) => setCompartilharDados(e.target.checked)}
              required
              className="accent-primary-600 bg-white border-primary-500 dark:accent-primary-500 dark:bg-neutral-800 dark:border-primary-600"
            />
            <label htmlFor="dataSharing" className="text-sm text-neutral-900 dark:text-neutral-100">
              Concordo em compartilhar meus dados
            </label>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full shadow-glow"
          >
            {modo === "login" ? "▶ Entrar" : "▶ Cadastrar"}
          </Button>
          {modo === "login" && (
            <p
              onClick={handleEsqueciSenha}
              className="text-primary-400 dark:text-primary-400 mt-2 cursor-pointer text-sm hover:underline text-center"
            >
              Esqueci minha senha
            </p>
          )}
        </form>
      </Card>
    </LayoutWrapper>
  );
}
