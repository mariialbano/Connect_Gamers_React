import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem, postItem } from "../services/api"; // Adicione este import se já não existir

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("siteTheme") === "dark" || false);
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true" || false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false); // NOVO
  const navigate = useNavigate();

  // Lista de avatares do site
  const siteAvatars = [
    "/assets/avatars/avatar1.webp",
    "/assets/avatars/avatar2.jpg",
    "/assets/avatars/avatar3.avif",
    "/assets/avatars/avatar4.avif",
  ];

  const handleSiteAvatarSelect = (avatarUrl) => {
    setProfileImage(avatarUrl);
    localStorage.setItem("profileImage", avatarUrl);
    setShowAvatarList(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("profileImage");
    if (saved) setProfileImage(saved);
  }, []);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleThemeToggle = () => {
    setDarkTheme(!darkTheme);
  };

  const handleVlibrasToggle = () => {
    setVlibrasActive(!vlibrasActive);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
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
      // Busca o usuário logado pelo e-mail salvo no localStorage
      const email = localStorage.getItem("usuarioLogado");
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

      // Atualiza a senha no JSON Server
      const response = await fetch(`http://localhost:3001/usuarios/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: newPassword }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar senha.");
      }

      alert("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    } catch (err) {
      alert("Erro ao alterar senha.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${darkTheme ? 'text-gray-200' : 'text-gray-800'}`}
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
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      ></div>
      
      <div 
        className="container mx-auto px-4 pt-24 pb-16 max-w-4xl 
        bg-gray-800
        rounded-xl my-8 shadow-lg
        backdrop-blur-sm"
      > 
        <div className="flex flex-col items-center mb-8 relative">
          <div 
            className="relative inline-block cursor-pointer"
            onClick={() => setShowAvatarList((prev) => !prev)}
          >
            <div 
              className="w-44 h-44 rounded-full border-4 border-[rgb(253,77,121)] shadow-lg mx-auto flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'rgba(58, 58, 74, 0.7)' }}
            >
              <img
                src={profileImage}
                alt="Foto do perfil"
                className="w-full h-full object-cover"
              />
            </div>
            {showAvatarList && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 bg-gray-900/95 p-4 rounded-xl shadow-xl flex gap-4 z-50 border border-pink-400">
                {siteAvatars.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt={`Avatar ${idx + 1}`}
                    className={`w-16 h-16 rounded-full border-2 cursor-pointer transition hover:border-pink-500 ${profileImage === avatar ? "border-pink-500" : "border-gray-300"}`}
                    onClick={() => handleSiteAvatarSelect(avatar)}
                    draggable={false}
                  />
                ))}
              </div>
            )}
          </div>
          <span className="mt-2 text-sm text-gray-400">Clique na foto para escolher um avatar</span>
        </div>

        <div className="text-center mb-12">
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-100">
              Nome do Usuário
            </h1>
            <p className="mt-2 text-lg text-gray-300">
              {localStorage.getItem("usuarioLogado") || "user@conectgamers.com"}
            </p>
            <div className="inline-block bg-[rgb(253,77,121)] text-white px-6 py-2 rounded-full text-sm mt-3 shadow-lg">
              Ranking: Ouro
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center text-gray-100">
              <i className="fas fa-calendar-alt mr-3 text-[rgb(253,77,121]"></i> Meus Eventos
            </h2>
            <div className="space-y-4">
              <div className="p-5 rounded-lg shadow-md transition-all hover:shadow-lg bg-gray-700/60 hover:bg-gray-700">
                <h3 className="font-bold text-lg text-gray-100">Torneio de Valorant</h3>
                <div className="flex items-center mt-2">
                  <i className="fas fa-calendar-day mr-2 text-gray-400"></i>
                  <p className="text-sm text-gray-300">25/05/2025 - Online</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="bg-[rgb(253,77,121)]/20 text-[rgb(253,77,121)] px-3 py-1 rounded-full text-xs font-medium">
                    Inscrito
                  </span>
                </div>
              </div>
              <div className="p-5 rounded-lg shadow-md transition-all hover:shadow-lg bg-gray-700/60 hover:bg-gray-700">
                <h3 className="font-bold text-lg text-gray-100">Campeonato de League of Legends</h3>
                <div className="flex items-center mt-2">
                  <i className="fas fa-calendar-day mr-2 text-gray-400"></i>
                  <p className="text-sm text-gray-300">02/06/2025 - Online</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <span className="bg-[rgb(253,77,121)]/20 text-[rgb(253,77,121)] px-3 py-1 rounded-full text-xs font-medium">
                    Inscrito
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Senha como aba */}
          <section className="mb-8">
            <button
              type="button"
              onClick={() => setShowPasswordSection((prev) => !prev)}
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
        </div>
      </div>
    </div>
  );
};

export default Profile;

