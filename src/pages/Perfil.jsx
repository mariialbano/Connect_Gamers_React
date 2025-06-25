import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem } from "../services/api";

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("siteTheme") === "dark");
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true");
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profileImage") || "https://via.placeholder.com/150");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Nome do Usuário");
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const navigate = useNavigate();

  const siteAvatars = [
    "/assets/avatars/avatar índia.jpg.png",
    "/assets/avatars/dinossauro avatar.jpg.png",
    "/assets/avatars/menina avatar.jpg.png",
    "/assets/avatars/menina cacheada avatar.jpg.png",
    "/assets/avatars/menino avatar.jpg.png",
  ];

  useEffect(() => {
    document.body.classList.toggle("dark-theme", darkTheme);
    document.body.classList.toggle("light-theme", !darkTheme);
    localStorage.setItem("siteTheme", darkTheme ? "dark" : "light");
  }, [darkTheme]);

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
  const handleThemeToggle = () => setDarkTheme(!darkTheme);
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

  // Componente de Avatar corrigido
  const AvatarSection = () => (
    <div className="flex flex-col items-center mb-0 relative">
      <div
        className="relative inline-block cursor-pointer"
        onClick={() => setShowAvatarList((prev) => !prev)}
      >
        <div
          className="w-32 h-32 rounded-full border-4 border-[rgb(253,77,121)] shadow-lg mx-auto flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: 'rgba(58, 58, 74, 0.7)' }}
        >
          <img
            src={profileImage}
            alt="Foto do perfil"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        {showAvatarList && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-gray-900/95 p-4 rounded-xl shadow-xl flex gap-4 z-50 border border-pink-400">
            {siteAvatars.map((avatar, idx) => (
              <img
                key={idx}
                src={avatar}
                alt={`Avatar ${idx + 1}`}
                className={`w-16 h-16 rounded-full border-2 cursor-pointer transition hover:border-pink-500 ${
                  profileImage === avatar ? "border-pink-500" : "border-gray-300"
                }`}
                onClick={() => handleSiteAvatarSelect(avatar)}
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
      <span className="mt-2 text-sm text-gray-400">Clique na foto para escolher um avatar</span>
    </div>
  );

  // Componente de Edição de Nome
  const NameEditSection = () => (
    <div className="text-center mb-12">
      <div className="mt-6">
        {editandoNome ? (
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              className="text-2xl font-bold text-gray-500 rounded-lg px-3 py-1"
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
              <h1 className="text-3xl font-bold text-gray-100">{nomeUsuario}</h1>
              <button
                className="ml-2 mt-2 text-gray-400 hover:text-pink-400 p-2 z-20 text-2xl"
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
        <p className="mt-1 text-lg text-gray-300">
          {localStorage.getItem("usuarioLogado") || "user@conectgamers.com"}
        </p>
        <div className="inline-block bg-[rgb(253,77,121)] text-white px-6 py-2 rounded-full text-sm mt-3 shadow-lg">
          Ranking: Ouro
        </div>
      </div>
    </div>
  );

  // Componente de Eventos
  const EventsSection = () => (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center text-gray-100">
        <i className="fas fa-calendar-alt mr-3 text-[rgb(253,77,121)]"></i> Meus Eventos
      </h2>
      <div className="space-y-4">
        {[1, 2].map((event) => (
          <div key={event} className="p-5 rounded-lg shadow-md transition-all hover:shadow-lg bg-gray-700/60 hover:bg-gray-700">
            <h3 className="font-bold text-lg text-gray-100">
              {event === 1 ? "Torneio de Valorant" : "Campeonato de League of Legends"}
            </h3>
            <div className="flex items-center mt-2">
              <i className="fas fa-calendar-day mr-2 text-gray-400"></i>
              <p className="text-sm text-gray-300">
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

  // Componente de Alteração de Senha
  const PasswordSection = () => (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setShowPasswordSection(!showPasswordSection)}
        className="w-full flex items-center justify-between bg-gray-700/60 border border-gray-600 rounded-xl px-6 py-4 text-lg font-bold text-gray-100 hover:bg-gray-700 transition-all focus:outline-none"
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
          className="p-8 rounded-xl shadow-lg bg-gray-700/60 border border-gray-600 mt-2 animate-fade-in"
        >
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-5">
              <label className="block mb-3 font-semibold text-gray-200">Senha Atual</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-gray-600 border border-gray-500 text-white"
                placeholder="Digite sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-3 font-semibold text-gray-200">Nova Senha</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-gray-600 border border-gray-500 text-white"
                placeholder="Digite a nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="mb-6">
              <label className="block mb-3 font-semibold text-gray-200">Confirmar Nova Senha</label>
              <input
                type="password"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-gray-600 border border-gray-500 text-white"
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
      className={`min-h-screen flex flex-col ${
        darkTheme ? 'text-gray-200' : 'text-gray-800'
      }`}
      style={{
        backgroundImage: darkTheme
          ? "url('/assets/IMAGENS/bg-dark.jpg')"
          : "url('/assets/IMAGENS/bg-light.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.5s'
      }}
    >
      {/* Overlay da sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={closeSidebar}
      ></div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl bg-gray-800 rounded-xl my-8 shadow-lg backdrop-blur-sm">
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
