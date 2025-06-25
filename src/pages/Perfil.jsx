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
        className="w-full h-full object-cover rounded-full" // Adicionei rounded-full aqui
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

