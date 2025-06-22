import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [seguranca, setSeguranca] = useState(false);
  const [compartilharDados, setCompartilharDados] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usuario || !senha || !seguranca || !compartilharDados) {
      alert("Por favor, preencha todos os campos e aceite os termos.");
      return;
    }

    // Aqui você pode adicionar verificação real de login se quiser
    alert("Login realizado com sucesso!");
    navigate("/perfil"); // redireciona para a rota /perfil
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-white">
        <h2 className="text-3xl font-bold text-center text-pink-500 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="usuario" className="block mb-1">
              E-mail
            </label>
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
            <label htmlFor="password" className="block mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              pattern="(?=.[A-Za-z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%*?&]{8,}"
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
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
