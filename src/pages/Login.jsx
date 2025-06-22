import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getItem, postItem } from "../services/api"; // ajuste o caminho conforme seu projeto

export default function Login() {
  const [modo, setModo] = useState("login");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
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

    if (!usuario || !senha || !seguranca || !compartilharDados) {
      alert("Por favor, preencha todos os campos e aceite os termos.");
      return;
    }

    const emailExiste = usuariosExistentes.find((u) => u.email === usuario);

    if (modo === "cadastro") {
      if (emailExiste) {
        alert("Este e-mail já está cadastrado!");
        return;
      }

      // Cadastra o novo usuário
      try {
        await postItem("usuarios", {
          email: usuario,
          senha: senha,
        });
        localStorage.setItem("usuarioLogado", usuario);
        alert("Cadastro realizado com sucesso!");
        navigate("/perfil");
      } catch (error) {
        alert("Erro ao cadastrar usuário.");
      }
    }

    if (modo === "login") {
      if (!emailExiste) {
        alert("E-mail não encontrado. Verifique ou cadastre-se primeiro.");
        return;
      }

      if (emailExiste.senha !== senha) {
        alert("Senha incorreta!");
        return;
      }

      localStorage.setItem("usuarioLogado", usuario);
      alert("Login realizado com sucesso!");
      navigate("/perfil");
    }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-white">
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setModo("login")}
            className={`px-4 py-2 font-bold ${modo === "login" ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-400"}`}
          >
            Login
          </button>
          <button
            onClick={() => setModo("cadastro")}
            className={`px-4 py-2 font-bold ${modo === "cadastro" ? "text-pink-500 border-b-2 border-pink-500" : "text-gray-400"}`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="usuario" className="block mb-1">E-mail</label>
            <input
              type="text"
              id="usuario"
              placeholder="Digite seu e-mail"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              pattern="(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}"
              title="A senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo"
              required
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <small className="text-gray-400">
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
            />
            <label htmlFor="securityAwareness" className="text-sm text-gray-300">
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
            />
            <label htmlFor="dataSharing" className="text-sm text-gray-300">
              Concordo em compartilhar meus dados
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            {modo === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
