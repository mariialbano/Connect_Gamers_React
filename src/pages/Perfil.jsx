import React, { useState, useEffect } from 'react';
import { getItem } from "../services/api";

/* ---------- Componentes filhos (estáveis) ---------- */

function AvatarSection({
  profileImage,
  siteAvatars,
  showAvatarList,
  onAvatarClick,
  onSelectAvatar
}) {
  return (
    <div className="flex flex-col items-center mb-0 relative">
      <div className="relative inline-block cursor-pointer" onClick={onAvatarClick}>
        <div
          className="w-32 h-auto rounded-full border-4 border-[rgb(253,77,121)] shadow-lg mx-auto flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'rgba(58, 58, 74, 0.7)' }}
        >
          <img src={profileImage} alt="Foto do perfil" className="w-full h-full object-cover rounded-xl" />
        </div>

        {showAvatarList && (
          <div className="mt-4 p-4 flex gap-4">
            {siteAvatars.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                className={`w-16 h-auto rounded-full border-2 cursor-pointer transition hover:border-pink-500 ${profileImage === avatar ? "border-pink-500" : "border-gray-300"}`}
                onClick={() => onSelectAvatar(avatar)}
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
      <span className="mt-2 text-sm text-gray-500">Clique na foto para escolher um avatar</span>
    </div>
  );
}

function NameEditSection({
  nomeUsuario,
  editandoNome,
  novoNome,
  setNovoNome,
  setEditandoNome,
  onSalvarNome
}) {
  return (
    <div className="text-center mb-12">
      <div className="mt-6">
        {editandoNome ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              className="text-2xl font-bold rounded-lg px-3 py-1 text-black dark:text-gray-500"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              maxLength={20}
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (novoNome.trim()) await onSalvarNome();
                } else if (e.key === "Escape") {
                  setEditandoNome(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-[rgb(253,77,121)] text-white px-4 py-1 rounded font-bold"
                onClick={onSalvarNome}
                disabled={!novoNome.trim()}
              >
                Salvar
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-1 rounded font-bold"
                onClick={() => setEditandoNome(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full relative">
            <div className="flex items-center justify-center mx-auto">
              <h1 className="text-3xl font-bold text-black dark:text-gray-100">
                Olá, {nomeUsuario}!
              </h1>
              <button
                type="button"
                className="ml-2 mt-2 text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 p-2 z-20 text-2xl"
                title="Editar nome"
                onClick={() => {
                  // inicializa com o nome atual para edição
                  setNovoNome(nomeUsuario === "Nome do Usuário" ? "" : nomeUsuario);
                  setEditandoNome(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <p className="mt-1 text-md text-gray-700 dark:text-gray-400">
          {localStorage.getItem("usuarioLogado")}
        </p>
        <div className="inline-block bg-[rgb(253,77,121)] text-white px-6 py-2 rounded-full text-sm mt-3 shadow-lg">
          Ranking: Ouro
        </div>
      </div>
    </div>
  );
}

function EventsSection() {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center text-black dark:text-gray-100">
        <i className="fas fa-calendar-alt mr-3 text-[rgb(253,77,121]"></i> Meus Eventos
      </h2>
      <div className="space-y-4">
        {[1, 2].map((event) => (
          <div key={event} className="p-5 rounded-lg shadow-md transition-all hover:shadow-lg bg-white border border-pink-200 dark:bg-gray-700/60 dark:hover:bg-gray-700 dark:border-gray-700">
            <h3 className="font-bold text-lg text-black dark:text-gray-100">
              {event === 1 ? "Torneio de Valorant" : "Campeonato de League of Legends"}
            </h3>
            <div className="flex items-center mt-2">
              <i className="fas fa-calendar-day mr-2 text-pink-400 dark:text-gray-400"></i>
              <p className="text-sm text-black dark:text-gray-300">
                {event === 1 ? "25/05/2025 - Online" : "02/06/2025 - Online"}
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <span className="bg-[rgb(253,77,121)]/20 text-[rgb(253,77,121)] px-3 py-1 rounded-full text-xs font-medium">
                Inscrito
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PasswordSection({
  showPasswordSection,
  setShowPasswordSection,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmitPassword
}) {
  // mesma regex do login.jsx
  const passwordPattern = "(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}";
  const passwordTitle = "A senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo";

  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setShowPasswordSection(!showPasswordSection)}
        className="w-full flex items-center justify-between rounded-xl px-6 py-4 text-lg font-bold transition-all bg-white border border-pink-200 text-black hover:bg-pink-50 dark:bg-gray-700/60 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
        aria-expanded={showPasswordSection}
        aria-controls="password-section"
      >
        <span>
          <i className="fas fa-lock mr-3 text-[rgb(253,77,121)]"></i>
          Alterar Senha
        </span>
        <span className="ml-2">
          {showPasswordSection ? (
            <i className="fas fa-chevron-up"></i>
          ) : (
            <i className="fas fa-chevron-down"></i>
          )}
        </span>
      </button>
      {showPasswordSection && (
        <div
          id="password-section"
          className="p-8 rounded-xl shadow-lg mt-2 animate-fade-in bg-white border border-pink-200 dark:bg-gray-700/60 dark:border-gray-600"
        >
          <form onSubmit={onSubmitPassword}>
            <div className="mb-5">
              <label className="block mb-3 font-semibold text-black dark:text-gray-200">Senha Atual</label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                autoComplete="current-password"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-3 font-semibold text-black dark:text-gray-200">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Digite a nova senha"
                required
                pattern={passwordPattern}
                title={passwordTitle}
              />
              <small className="text-gray-600 dark:text-gray-400">
                A senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo
              </small>
            </div>

            <div className="mb-6">
              <label className="block mb-3 font-semibold text-black dark:text-gray-200">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Confirme a nova senha"
                required
                pattern={passwordPattern}
                title={passwordTitle}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[rgb(253,77,121)] hover:bg-[rgb(220,60,100)] text-white py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
            >
              Atualizar Senha
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

/* ---------- Componente principal Profile (export default) ---------- */

const Profile = () => {
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "/assets/avatars/india-avatar.png");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Nome do Usuário"); // Nome alterável
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const siteAvatars = [
    "/assets/avatars/india-avatar.png",
    "/assets/avatars/dinossauro-avatar.png",
    "/assets/avatars/menina-avatar.png",
    "/assets/avatars/menina-cacheada-avatar.png",
    "/assets/avatars/menino-avatar.png",
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usuarioLogado = localStorage.getItem("usuarioLogado"); // login permanente
        if (!usuarioLogado) return;

        const usuarios = await getItem("usuarios");
        const usuario = usuarios.find((u) => u.usuario === usuarioLogado); // busca pelo login
        if (usuario) {
          setNomeUsuario(usuario.nome || "Nome do Usuário"); // carrega o nome
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleSiteAvatarSelect = (avatarUrl) => {
    setProfileImage(avatarUrl);
    localStorage.setItem("profileImage", avatarUrl);
    setShowAvatarList(false);
  };

  // mesma regex do login.jsx (em JS)
  const passwordRegex = /(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // valida formato da senha (mesma regra do cadastro)
    if (!passwordRegex.test(newPassword)) {
      alert("A nova senha deve ter pelo menos 8 caracteres, incluindo letras, números e um símbolo.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const usuarioLogado = localStorage.getItem("usuarioLogado");
      if (!usuarioLogado) {
        alert("Usuário não encontrado.");
        return;
      }

      const usuarios = await getItem("usuarios");
      const usuario = usuarios.find((u) => u.usuario === usuarioLogado);

      if (!usuario) {
        alert("Usuário não encontrado.");
        return;
      }

      if (usuario.senha !== currentPassword) {
        alert("Senha atual incorreta!");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: newPassword }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar senha.");

      alert("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      alert("Erro ao alterar senha.");
    }
  };

  const handleSalvarNome = async () => {
    try {
      const usuarioLogado = localStorage.getItem("usuarioLogado");
      if (!usuarioLogado || !novoNome.trim()) return;

      const usuarios = await getItem("usuarios");
      const usuario = usuarios.find((u) => u.usuario === usuarioLogado);
      if (!usuario) return;

      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome }), // salva o nome
      });

      if (!response.ok) throw new Error("Erro ao atualizar nome.");

      setNomeUsuario(novoNome); // atualiza na tela
      setEditandoNome(false);
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      alert("Não foi possível atualizar o nome. Tente novamente.");
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarList((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col text-black dark:text-gray-200">
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl bg-[#d9dbe2] dark:bg-gray-800 rounded-xl my-8 shadow-lg backdrop-blur-sm">
        <AvatarSection
          profileImage={profileImage}
          siteAvatars={siteAvatars}
          showAvatarList={showAvatarList}
          onAvatarClick={handleAvatarClick}
          onSelectAvatar={handleSiteAvatarSelect}
        />
        <NameEditSection
          nomeUsuario={nomeUsuario}
          editandoNome={editandoNome}
          novoNome={novoNome}
          setNovoNome={setNovoNome}
          setEditandoNome={setEditandoNome}
          onSalvarNome={handleSalvarNome}
        />

        <div className="max-w-2xl mx-auto">
          <EventsSection />
          <PasswordSection
            showPasswordSection={showPasswordSection}
            setShowPasswordSection={setShowPasswordSection}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmitPassword={handlePasswordSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
