import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItem, postItem } from "../services/api";

export default function Login() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState(""); // Agora é nome de usuário, não email
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState(""); // Novo campo para cadastro
  const [seguranca, setSeguranca] = useState(false);
  const [compartilharDados, setCompartilharDados] = useState(false);
  const [usuariosExistentes, setUsuariosExistentes] = useState([]);

  const navigate = useNavigate();

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

    if (!usuario || !senha || !seguranca || !compartilharDados || (modo === "cadastro" && !nome)) {
      alert("Preencha todos os campos e aceite os termos.");
      return;
    }

    const usuarioExiste = usuariosExistentes.find((u) => u.usuario === usuario);

    if (modo === "cadastro") {
      if (usuarioExiste) {
        alert("Este nome de usuário já está cadastrado!");
        return;
      }

      try {
        const novo = await postItem("usuarios", { nome, usuario, senha });
        localStorage.setItem("usuarioLogado", usuario);
        localStorage.setItem("usuarioId", novo.id);
        alert("Cadastro realizado com sucesso!");
        navigate("/perfil");
      } catch (error) {
        alert("Erro ao cadastrar usuário.");
      }
    }

    if (modo === "login") {
      if (!usuarioExiste) {
        alert("Usuário não encontrado. Verifique ou cadastre-se primeiro.");
        return;
      }

      if (usuarioExiste.senha !== senha) {
        alert("Senha incorreta!");
        return;
      }

  localStorage.setItem("usuarioLogado", usuario);
  localStorage.setItem("usuarioId", usuarioExiste.id);
      alert("Login realizado com sucesso!");
      navigate("/perfil");
    }
  };

  const handleEsqueciSenha = () => {
    const usuarioEncontrado = usuariosExistentes.find((u) => u.usuario === usuario);
    if (!usuario) {
      alert("Digite seu nome de usuário para recuperar a senha.");
    } else if (!usuarioEncontrado) {
      alert("Usuário não encontrado.");
    } else {
      alert(`Sua senha é: ${usuarioEncontrado.senha}`);
    }
  };

  return (
    <div className="flex justify-center py-10 px-4">
  <div className="bg-[#d9dbe2] dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-black dark:text-white">
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setModo("login")}
            /* Contraste tabs: ativo pink-800, inativo gray-600 */
            className={`px-4 py-2 font-bold transition-colors ${modo === "login" ? "text-pink-800 dark:text-pink-400 border-b-2 border-pink-800 dark:border-pink-400" : "text-gray-600 dark:text-gray-400 hover:text-pink-700 dark:hover:text-pink-300"}`}
          >
            Login
          </button>
          <button
            onClick={() => setModo("cadastro")}
            /* Contraste tabs: ativo pink-800, inativo gray-600 */
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
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
              title="A senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo"
              required
              className="w-full px-4 py-2 rounded-md bg-[#f3f4f6] text-black placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <small className="text-gray-600 dark:text-gray-400">
              A senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo
            </small>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="securityAwareness"
              checked={seguranca}
              onChange={(e) => setSeguranca(e.target.checked)}
              required
              className="accent-pink-500 bg-white border-gray-300 dark:accent-pink-500 dark:bg-gray-800 dark:border-gray-600"
            />
            <label htmlFor="securityAwareness" className="text-sm text-black dark:text-gray-300">
              Estou ciente das práticas de segurança do site
            </label>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="dataSharing"
              checked={compartilharDados}
              onChange={(e) => setCompartilharDados(e.target.checked)}
              required
              className="accent-pink-500 bg-white border-gray-300 dark:accent-pink-500 dark:bg-gray-800 dark:border-gray-600"
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
