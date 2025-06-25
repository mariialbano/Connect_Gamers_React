import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(localStorage.getItem("siteTheme") === "dark" || false);
  const [vlibrasActive, setVlibrasActive] = useState(localStorage.getItem("vlibrasAtivo") === "true" || false);
  const [profileImage, setProfileImage] = useState("https://via.placeholder.com/150");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    alert("Senha alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={closeSidebar}
      ></div>
      
      {/* Container principal - Cinza escuro transparente */}
      <div 
        className="container mx-auto px-4 pt-24 pb-16 max-w-4xl 
        bg-gray-800
        rounded-xl my-8 shadow-lg
        backdrop-blur-sm"
      > 
        {/* Cabeçalho do Perfil */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div 
              className="w-44 h-44 rounded-full border-4 border-[)rgb(253,77,121] shadow-lg mx-auto flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: 'rgba(58, 58, 74, 0.7)' }}
            >
              <img
                src={profileImage}
                alt="Foto do perfil"
                className="w-full h-fu      ll object-cover"
              />
            </div>
            <label
              htmlFor="profilePictureInput"
              className="absolute bottom-3 right-3 bg-[rgb(253,77,121)] text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer hover:bg-[rgb(220,60,100)] transition shadow-md"
            >
              <i className="fas fa-camera mr-1"></i> Alterar
            </label>
            <input
              type="file"
              id="profilePictureInput"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="mt-6">
            <h1 className="text-3xl font-bold text-gray-100">
              Nome do Usuário
            </h1>
            <p className="mt-2 text-lg text-gray-300">user@conectgamers.com</p>
            <div className="inline-block bg-[rgb(253,77,121)] text-white px-6 py-2 rounded-full text-sm mt-3 shadow-lg">
              Ranking: Ouro
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Seção de Eventos */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center text-gray-100">
              <i className="fas fa-calendar-alt mr-3 text-[rgb(253,77,121)]"></i> Meus Eventos
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

          {/* Seção de Senha */}
          <section className="p-8 rounded-xl shadow-lg bg-gray-700/60 border border-gray-600">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-[rgb(253,77,121)] flex justify-center items-center text-gray-100">
              <i className="fas fa-lock mr-3 text-[rgb(253,77,121)]"></i> Alterar Senha
            </h2>
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;