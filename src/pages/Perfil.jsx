import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem } from "../services/api";
import { useTheme } from "../theme/ThemeContext";

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true");
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "https://via.placeholder.com/150");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [avatarListVisible, setAvatarListVisible] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Nome do Usuário");
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const navigate = useNavigate(); 
  const { theme } = useTheme();

  const siteAvatars = [
    "/assets/avatars/avatar índia.jpg.png",
    "/assets/avatars/dinossauro avatar.jpg.png",
    "/assets/avatars/menina avatar.jpg.png",
    "/assets/avatars/menina cacheada avatar.jpg.png",
    "/assets/avatars/menino avatar.jpg.png",
  ];

  useEffect(() => {
    if (vlibrasActive && window.VLibras) {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
    }
    localStorage.setItem("vlibrasAtivo", vlibrasActive);
  }, [vlibrasActive]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem("usuarioLogado");
        if (!email) return;

        const usuarios = await getItem("usuarios");
        const usuario = usuarios.find((u) => u.email === email);

        if (usuario) {
          setNomeUsuario(usuario.nome || "Nome do Usuário");
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const handleVlibrasToggle = () => setVlibrasActive(!vlibrasActive);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
        localStorage.setItem("profileImage", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const email = localStorage.getItem("usuarioLogado");
      if (!email) {
        alert("Usuário não encontrado.");
        return;
      }

      const usuarios = await getItem("usuarios");
      const usuario = usuarios.find((u) => u.email === email);

      if (!usuario) {
        alert("Usuário não encontrado.");
        return;
      }

      if (usuario.senha !== currentPassword) {
        alert("Senha atual incorreta!");
        return;
      }

      const response = await fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
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
      const email = localStorage.getItem("usuarioLogado");
      if (!email || !novoNome.trim()) return;

      const usuarios = await getItem("usuarios");
      const usuario = usuarios.find((u) => u.email === email);
      if (!usuario) return;

      await fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome }),
      });

      setNomeUsuario(novoNome);
      setEditandoNome(false);
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarList((prev) => !prev);
  };

  const AvatarSection = () => (
    <div className="flex flex-col items-center mb-0 relative">
      <div
        className="relative inline-block cursor-pointer"
        onClick={handleAvatarClick}
      >
        <div
          className="w-32 h-auto rounded-full border-4 border-[rgb(253,77,121)] shadow-lg mx-auto flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'rgba(58, 58, 74, 0.7)' }}
        >
          <img
            src={profileImage}
            alt="Foto do perfil"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        {showAvatarList && (
          <div className="mt-4 p-4 flex gap-4">
            {siteAvatars.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                className={`w-16 h-auto rounded-full border-2 cursor-pointer transition hover:border-pink-500 ${profileImage === avatar ? "border-pink-500" : "border-gray-300"}`}
                onClick={() => handleSiteAvatarSelect(avatar)}
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
      <span className="mt-2 text-sm text-gray-500">Clique na foto para escolher um avatar</span>
    </div>
  );

  const NameEditSection = () => (
    <div className="text-center mb-12">
      <div className="mt-6">
        {editandoNome ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              className={`text-2xl font-bold rounded-lg px-3 py-1 ${theme === "dark" ? "text-gray-500" : "text-black"}`}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                className="bg-[rgb(253,77,121)] text-white px-4 py-1 rounded font-bold"
                onClick={handleSalvarNome}
                disabled={!novoNome.trim()}
              >
                Salvar
              </button>
              <button
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
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-gray-100" : "text-black"}`}>{nomeUsuario}</h1>
              <button
                className={`ml-2 mt-2 ${theme === "dark" ? "text-gray-400 hover:text-pink-400" : "text-gray-600 hover:text-pink-600"} p-2 z-20 text-2xl`}
                title="Editar nome"
                onClick={() => {
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
        <p className={`mt-1 text-lg ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
          {localStorage.getItem("usuarioLogado") || "user@conectgamers.com"}
        </p>
        <div className="inline-block bg-[rgb(253,77,121)] text-white px-6 py-2 rounded-full text-sm mt-3 shadow-lg">
          Ranking: Ouro
        </div>
      </div>
    </div>
  );

  const EventsSection = () => (
    <section className="mb-12">
      <h2 className={`text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center ${theme === "dark" ? "text-gray-100" : "text-black"}`}>
        <i className="fas fa-calendar-alt mr-3 text-[rgb(253,77,121)]"></i> Meus Eventos
      </h2>
      <div className="space-y-4">
        {[1, 2].map((event) => (
          <div key={event} className={`p-5 rounded-lg shadow-md transition-all hover:shadow-lg ${theme === "dark" ? "bg-gray-700/60 hover:bg-gray-700" : "bg-white border border-pink-200"}`}>
            <h3 className={`font-bold text-lg ${theme === "dark" ? "text-gray-100" : "text-black"}`}>
              {event === 1 ? "Torneio de Valorant" : "Campeonato de League of Legends"}
            </h3>
            <div className="flex items-center mt-2">
              <i className={`fas fa-calendar-day mr-2 ${theme === "dark" ? "text-gray-400" : "text-pink-400"}`}></i>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-black"}`}>
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

  const PasswordSection = () => (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setShowPasswordSection(!showPasswordSection)}
        className={`w-full flex items-center justify-between rounded-xl px-6 py-4 text-lg font-bold transition-all focus:outline-none
          ${theme === "dark"
            ? "bg-gray-700/60 border border-gray-600 text-gray-100 hover:bg-gray-700"
            : "bg-white border border-pink-200 text-black hover:bg-pink-50"}
        `}
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
          className={`p-8 rounded-xl shadow-lg mt-2 animate-fade-in
            ${theme === "dark"
              ? "bg-gray-700/60 border border-gray-600"
              : "bg-white border border-pink-200"}
          `}
        >
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-5">
              <label className={`block mb-3 font-semibold ${theme === "dark" ? "text-gray-200" : "text-black"}`}>Senha Atual</label>
              <input
                type="password"
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)]
                  ${theme === "dark"
                    ? "bg-gray-600 border border-gray-500 text-white"
                    : "bg-[#f3f4f6] border border-pink-300 text-black"}
                `}
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label className={`block mb-3 font-semibold ${theme === "dark" ? "text-gray-200" : "text-black"}`}>Nova Senha</label>
              <input
                type="password"
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)]
                  ${theme === "dark"
                    ? "bg-gray-600 border border-gray-500 text-white"
                    : "bg-[#f3f4f6] border border-pink-300 text-black"}
                `}
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="mb-6">
              <label className={`block mb-3 font-semibold ${theme === "dark" ? "text-gray-200" : "text-black"}`}>Confirmar Nova Senha</label>
              <input
                type="password"
                className={`w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)]
                  ${theme === "dark"
                    ? "bg-gray-600 border border-gray-500 text-white"
                    : "bg-[#f3f4f6] border border-pink-300 text-black"}
                `}
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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

  return (
    <div
      className={`min-h-screen flex flex-col ${theme === "dark" ? 'text-gray-200' : 'text-black'}`}
      style={{
        backgroundImage: theme === "dark"
          ? "url('/assets/IMAGENS/bg-dark.jpg')"
          : "none",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s'
      }}
    >
      {/* Conteúdo principal */}
      <div className={
        theme === "dark"
          ? "container mx-auto px-4 pt-24 pb-16 max-w-4xl bg-gray-800 rounded-xl my-8 shadow-lg backdrop-blur-sm"
          : "container mx-auto px-4 pt-24 pb-16 max-w-4xl bg-[#d9dbe2] rounded-xl my-8 shadow-lg backdrop-blur-sm"
      }>
        <AvatarSection />
        <NameEditSection />

        <div className="max-w-2xl mx-auto">
          <EventsSection />
          <PasswordSection />
        </div>
      </div>
    </div>
  );
};

export default Profile;
