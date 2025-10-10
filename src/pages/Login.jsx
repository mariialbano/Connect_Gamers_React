import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getItem, postItem } from "../services/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
      if (!usuarioExiste) {
        alert("Usuário não encontrado. Verifique ou cadastre-se primeiro.");
        return;
      }

      try {
        // Chama a rota de login no backend que faz a verificação com bcrypt
        const logged = await postItem('usuarios/login', { usuario, senha });
        // Se retornou OK, salva info e navega
        const nivelAcesso = (logged.cargo || logged.nivelAcesso || 'user').toLowerCase();
        localStorage.setItem('usuarioLogado', logged.usuario || usuario);
        localStorage.setItem('usuarioId', logged.id);
        localStorage.setItem('usuarioNivelAcesso', nivelAcesso);
        localStorage.setItem('isAdmin', String(nivelAcesso === 'admin'));
        alert('Login realizado com sucesso!');
        navigate(from || '/perfil');
      } catch (err) {
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
    <div className="flex justify-center py-10 px-4">
      <div className="bg-[#d9dbe2] dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-black dark:text-white">
        {authRequired && (
          <div className="mb-6 p-3 rounded-md text-sm font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-300 dark:border-pink-700">
            Faça login para acessar esta página.
          </div>
        )}
        {adminRequired && (
          <div className="mb-6 p-3 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
            Apenas o administrador pode entrar nesta área. Use o usuário <strong>admin</strong>.
          </div>
        )}
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setModo("login")}
            className={`px-4 py-2 font-bold transition-colors ${modo === "login" ? "text-pink-800 dark:text-pink-400 border-b-2 border-pink-800 dark:border-pink-400" : "text-gray-600 dark:text-gray-400 hover:text-pink-700 dark:hover:text-pink-300"}`}
          >
            Login
          </button>
          <button
            onClick={() => setModo("cadastro")}
            className={`px-4 py-2 font-bold transition-colors ${modo === "cadastro" ? "text-pink-800 dark:text-pink-400 border-b-2 border-pink-800 dark:border-pink-400" : "text-gray-600 dark:text-gray-400 hover:text-pink-700 dark:hover:text-pink-300"}`}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {modo === "cadastro" && (
            <div>
              <label htmlFor="nome" className="block mb-1 text-black dark:text-white">Nome</label>
              <input
                type="text"
                id="nome"
                placeholder="Digite seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          )}

          <div>
            <label htmlFor="usuario" className="block mb-1 text-black dark:text-white">Nome de usuário</label>
            <input
              type="text"
              id="usuario"
              placeholder="Digite seu nome de usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-black dark:text-white">Senha</label>
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
                className="w-full px-4 py-2 pr-12 rounded-md bg-[#f3f4f6] text-black placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
            <small className="text-gray-600 dark:text-gray-400">
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
              className="checkbox-pink accent-pink-600 bg-white border-pink-500 dark:accent-pink-500 dark:bg-gray-800 dark:border-pink-600"
            />
            <label htmlFor="securityAwareness" className="text-sm text-black dark:text-gray-300">
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
              className="checkbox-pink accent-pink-600 bg-white border-pink-500 dark:accent-pink-500 dark:bg-gray-800 dark:border-pink-600"
            />
            <label htmlFor="dataSharing" className="text-sm text-black dark:text-gray-300">
              Concordo em compartilhar meus dados
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {modo === "login" ? "Entrar" : "Cadastrar"}
          </button>
          {modo === "login" && (
            <p
              onClick={handleEsqueciSenha}
              className="text-pink-400 dark:text-pink-400 mt-2 cursor-pointer text-sm hover:underline text-center"
            >
              Esqueci minha senha
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
