import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaQrcode, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE } from '../services/apiBase';
import { getItem, postItem } from '../services/api';

// Avatar
function AvatarSection({ profileImage, siteAvatars, showAvatarList, onToggleList, onSelectAvatar }) {
  return (
    <div className="flex flex-col items-center mb-10">
      <button
        type="button"
        onClick={onToggleList}
        className="focus-avatar group relative rounded-full ring-4 ring-pink-800 shadow-xl transition-all"
        aria-label="Alterar avatar"
        title="Clique para escolher um avatar"
      >
        <span className="block w-32 h-44 md:w-36 md:h-52 rounded-full overflow-hidden relative">
          <img src={profileImage} alt="Avatar do usuário" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition-opacity">Trocar Avatar</span>
        </span>
      </button>
      {showAvatarList && (
        <div className="grid grid-cols-5 gap-3 mt-4 p-2">
          {siteAvatars.map(av => {
            const selected = profileImage === av;
            return (
              <button
                key={av}
                type="button"
                onClick={() => onSelectAvatar(av)}
                className={`focus-avatar relative w-14 h-20 rounded-full transition-all hover:scale-105 ${selected ? 'border-2 border-pink-500 dark:border-pink-400' : ''}`}
                aria-label="Selecionar avatar"
              >
                <span className="absolute inset-0 rounded-full overflow-hidden">
                  <img src={av} alt="Opção de avatar" className="w-full h-full object-cover" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Nome e Edição 
function NameEditSection({ nomeUsuario, editandoNome, novoNome, setNovoNome, setEditandoNome, onSalvarNome }) {
  return (
    <div className="text-center mb-12">
      {editandoNome ? (
        <div className="flex flex-col items-center gap-2">
          <input
            type="text"
            className="text-2xl font-bold rounded-lg px-3 py-1 text-black dark:text-gray-900"
            value={novoNome}
            onChange={e => setNovoNome(e.target.value)}
            maxLength={20}
            autoFocus
            onKeyDown={async e => {
              if (e.key === 'Enter' && novoNome.trim()) { e.preventDefault(); await onSalvarNome(); }
              else if (e.key === 'Escape') setEditandoNome(false);
            }}
          />
          <div className="flex gap-2">
            <button type="button" className="bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white px-4 py-1 rounded font-bold disabled:opacity-50" disabled={!novoNome.trim()} onClick={onSalvarNome}>Salvar</button>
            <button type="button" className="bg-gray-500 text-white px-4 py-1 rounded font-bold" onClick={() => setEditandoNome(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full relative">
          <div className="flex items-center justify-center mx-auto">
            <h1 className="text-3xl font-bold text-black dark:text-gray-100">Olá, {nomeUsuario}!</h1>
            <button
              type="button"
              aria-label="Editar nome do usuário"
              className="ml-2 mt-2 text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 p-2 text-2xl"
              title="Editar nome"
              onClick={() => { setNovoNome(nomeUsuario === 'Nome do Usuário' ? '' : nomeUsuario); setEditandoNome(true); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <p className="mt-1 text-md text-gray-700 dark:text-gray-400">{localStorage.getItem('usuarioLogado')}</p>
      <div className="inline-block text-sm md:text-base bg-pink-600/15 text-pink-800 dark:text-pink-300 px-4 py-2 rounded-full font-semibold mt-4 tracking-wide">Ranking: Ouro</div>
    </div>
  );
}

// Meus Eventos
function EventsSection({ usuarioLogado }) {
  const [meusSquads, setMeusSquads] = useState([]);
  const [eventos, setEventos] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [origemEventos, setOrigemEventos] = useState('eventos');
  const [mapUsuarios, setMapUsuarios] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (!usuarioLogado) { return; }
      setLoading(true); setErro(null);
      try {
        const squads = await getItem('squads');
        // Carrega usuarios para mapear usuario -> nome
        let usuarios = [];
        try { usuarios = await getItem('usuarios'); } catch { usuarios = []; }
        const mapa = {};
        (usuarios || []).forEach(u => {
          if (u && u.usuario) {
            mapa[u.usuario.toLowerCase()] = (u.nome && u.nome.trim()) || u.usuario;
          }
        });
        setMapUsuarios(mapa);
        let eventosData = {};
        try {
          eventosData = await getItem('eventos');
          setOrigemEventos('eventos');
        } catch (evErr) {
          console.warn('Falha ao obter /api/eventos, tentando /api/games fallback', evErr);
          try {
            const games = await getItem('games');
            const rebuilt = {};
            (games || []).forEach(g => { if (Array.isArray(g.events)) rebuilt[g.name] = g.events; });
            eventosData = rebuilt;
            setOrigemEventos('games-fallback');
          } catch (gErr) {
            console.error('Também falhou /api/games fallback', gErr);
            eventosData = {};
          }
        }
        setEventos(eventosData || {});
        const userLower = usuarioLogado.toLowerCase();
        const squadsDoUsuario = (squads || []).filter(sq => Array.isArray(sq.integrantes) && sq.integrantes.some(n => (n || '').toLowerCase().trim() === userLower));
        setMeusSquads(squadsDoUsuario);
        if (!Object.keys(eventosData || {}).length) {
          setErro('Nenhum evento disponível no momento.');
        }
      } catch (e) {
        console.error('Erro ao carregar dados de eventos/squads', e);
        setErro('Falha ao carregar seus eventos.');
        setMeusSquads([]);
      } finally { setLoading(false); }
    }
    fetchData();
  }, [usuarioLogado]);

  const todosEventos = Array.isArray(eventos) ? eventos : Object.values(eventos || {}).flat();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-pink-800 flex justify-center items-center text-black dark:text-gray-100">
        <i className="fas fa-calendar-alt mr-3 text-pink-800 dark:text-pink-400" /> Meus Eventos
      </h2>
      {loading && <div className="text-center text-gray-500">Carregando eventos...</div>}
      {erro && <div className="text-center text-red-500">{erro}</div>}
      {!loading && !erro && origemEventos === 'games-fallback' && <div className="text-center text-xs text-gray-500 mb-4">(Usando lista de eventos reconstruída a partir dos jogos)</div>}
      {!loading && !erro && meusSquads.length === 0 && <div className="text-center text-gray-500">Você ainda não está inscrito em nenhum evento.</div>}
      <div className="grid gap-5 md:grid-cols-2">
        {meusSquads.map(squad => {
          const evento = todosEventos.find(ev => ev.id === squad.eventoId);
          return (
            <div key={squad.id} className="p-5 rounded-xl bg-white dark:bg-gray-700 border border-pink-200 dark:border-gray-600 shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-black dark:text-white">{evento ? evento.nome : 'Evento não encontrado'}</h3>
                <span className="text-xs bg-pink-500/20 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full font-semibold">{squad.jogo}</span>
              </div>
              {evento && <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{evento.dia} • {evento.horario}</p>}
              <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-200">Squad: {squad.nomeSquad}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">Nível: {squad.nivel}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {squad.integrantes.slice(0, 8).map((usuarioRaw, idx) => {
                  const key = (usuarioRaw || '').toLowerCase().trim();
                  const display = mapUsuarios[key] || usuarioRaw || '—';
                  return (
                    <span key={idx} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full" title={usuarioRaw}>{display}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Verificação Facial
function FacialVerificationSection({ usuarioId }) {
  const [verificationStatus, setVerificationStatus] = useState({ isVerified: false, hasFaceData: false });
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usuarioLogado = typeof window !== 'undefined' ? localStorage.getItem('usuarioLogado') : null;
  const qrTimeoutRef = React.useRef();

  useEffect(() => {
    if (usuarioId) {
      console.log('FacialVerificationSection: Verificando status para usuário:', usuarioId);
      checkVerificationStatus();
    } else if (usuarioLogado) {
      console.log('FacialVerificationSection: usuarioId ausente, mas temos username:', usuarioLogado, '— status só será checado após verificação.');
    } else {
      console.log('FacialVerificationSection: Aguardando credenciais (usuarioId/usuarioLogado)...');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioId, usuarioLogado]);

  const checkVerificationStatus = async () => {
    if (!usuarioId) {
      console.log('checkVerificationStatus: usuarioId não disponível');
      return;
    }
    
    try {
      console.log('Verificando status de verificação para:', usuarioId);
      const response = await fetch(`${API_BASE}/api/verification/status/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Status de verificação obtido:', data);
        setVerificationStatus(data);
      } else {
        console.error('Erro ao verificar status:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const generateQRCode = async () => {
    if (qrTimeoutRef.current) {
      clearTimeout(qrTimeoutRef.current);
      qrTimeoutRef.current = null;
    }
    if (!usuarioId && !usuarioLogado) {
      console.log('Erro: credenciais não definidas. usuarioId:', usuarioId, 'usuarioLogado:', usuarioLogado);
      setError('Não foi possível identificar o usuário. Faça login novamente.');
      return;
    }
    
    console.log('Gerando QR Code para:', { usuarioId, usuarioLogado });
    setLoading(true);
    setError('');
    
    try {
      console.log('Fazendo requisição para:', `${API_BASE}/api/verification/generate-qr`);
      const response = await fetch(`${API_BASE}/api/verification/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: usuarioId || undefined, username: usuarioLogado || undefined })
      });

      console.log('Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('QR Code gerado com sucesso:', data);
        // Exibe modal dentro da mesma aba (sem abrir nova janela)
        setQrCode(data.qrCode);
        setVerificationUrl(data.verificationUrl || '');
        setShowQRCode(true);
        
        // Auto-refresh status após 5 minutos
        qrTimeoutRef.current = setTimeout(() => {
          setShowQRCode(false);
          checkVerificationStatus();
          qrTimeoutRef.current = null;
        }, 5 * 60 * 1000);
      } else {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        if (response.status === 404) {
          setError('Usuário não encontrado. Faça login novamente e tente gerar o QR Code.');
        } else {
          setError(errorData.error || 'Erro ao gerar QR Code');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-pink-200 dark:border-gray-600 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-black dark:text-white flex items-center">
            <FaCheckCircle className={`mr-3 ${verificationStatus.isVerified ? 'text-green-500' : 'text-gray-400'}`} />
            Verificação Facial
          </h3>
          {verificationStatus.isVerified && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300">
              Verificado
            </span>
          )}
        </div>

        {!usuarioId && !usuarioLogado ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-800 mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-300">
              Carregando dados do usuário...
            </p>
          </div>
        ) : verificationStatus.isVerified ? (
          <div className="text-center py-4">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300">
              Sua conta está verificada! A verificação facial foi concluída com sucesso.
            </p>
          </div>
        ) : (
          <div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mr-3 mt-1" />
                <div>
                  <h4 className="text-yellow-800 dark:text-yellow-300 font-semibold mb-1">
                    Conta não verificada
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Verifique sua identidade usando reconhecimento facial para aumentar a segurança da sua conta.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={generateQRCode}
              disabled={loading}
              className="w-full bg-pink-800 hover:bg-pink-900 disabled:bg-pink-400 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Gerando QR Code...
                </>
              ) : (
                <>
                  <FaQrcode className="mr-2" />
                  Verifique sua conta
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-pink-200 dark:border-gray-700 shadow-2xl">
            <button
              type="button"
              aria-label="Fechar"
              className="absolute right-3 top-3 text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
              onClick={() => {
                setShowQRCode(false);
                if (qrTimeoutRef.current) {
                  clearTimeout(qrTimeoutRef.current);
                  qrTimeoutRef.current = null;
                }
              }}
            >
              ✕
            </button>
            <div className="p-6">
              <h4 className="text-lg font-bold text-center text-black dark:text-white">Escaneie com o celular</h4>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300 mt-1">Abra a câmera do seu celular e aponte para o QR Code.</p>
              <div className="flex justify-center mt-4">
                <img src={qrCode} alt="QR Code para verificação facial" className="border rounded-lg w-64 h-64 bg-white p-2" />
              </div>
              {verificationUrl && (
                <p className="text-xs text-center text-emerald-700 dark:text-emerald-300 mt-3 break-words">
                  Ou acesse: <span className="underline">{verificationUrl}</span>
                </p>
              )}
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">Este código expira em 5 minutos.</p>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    if (qrTimeoutRef.current) {
                      clearTimeout(qrTimeoutRef.current);
                      qrTimeoutRef.current = null;
                    }
                  }}
                  className="text-pink-800 dark:text-pink-400 hover:underline text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Alterar Senha
function PasswordSection({ showPasswordSection, setShowPasswordSection, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, onSubmitPassword }) {
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const passwordPattern = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}';
  const passwordTitle = 'A nova senha deve ter ao menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos';
  return (
    <section className="mb-8">
      <button
        type="button"
        onClick={() => setShowPasswordSection(!showPasswordSection)}
        className="w-full flex items-center justify-between rounded-xl px-6 py-4 text-lg font-bold transition-all bg-white border border-pink-200 text-black hover:bg-pink-50 dark:bg-gray-700/60 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
        aria-controls="password-section"
        aria-expanded={showPasswordSection}
      >
        <span className="justify-center"><i className="fas fa-lock mr-3 text-pink-800 dark:text-pink-400" /> Alterar Senha</span>
        <span className="ml-2">{showPasswordSection ? <i className="fas fa-chevron-up" /> : <i className="fas fa-chevron-down" />}</span>
      </button>
      <div id="password-section" className={`overflow-hidden transition-all duration-300 p-0 rounded-xl shadow-lg mt-2 bg-white border border-pink-200 dark:bg-gray-700/60 dark:border-gray-600 ${showPasswordSection ? 'animate-slide-fade-in max-h-[1000px]' : 'animate-slide-fade-out max-h-0'}`} aria-hidden={!showPasswordSection}>
        {showPasswordSection && (
          <form onSubmit={onSubmitPassword} className="p-8">
            <div className="mb-5">
              <label className="block mb-3 font-semibold text-black dark:text-white">Senha Atual</label>
              <div className="relative">
                <input type={mostrarAtual ? 'text' : 'password'} name="currentPassword" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" autoComplete="current-password" className="w-full p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-white/65" />
                <button
                  type="button"
                  onClick={() => setMostrarAtual(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label={mostrarAtual ? 'Ocultar senha atual' : 'Mostrar senha atual'}
                >
                  {mostrarAtual ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="mb-5">
              <label className="block mb-3 font-semibold text-black dark:text-white">Nova Senha</label>
              <div className="relative">
                <input type={mostrarNova ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-white/65" placeholder="Digite a nova senha" required pattern={passwordPattern} title={passwordTitle} />
                <button
                  type="button"
                  onClick={() => setMostrarNova(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label={mostrarNova ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                >
                  {mostrarNova ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small className="text-gray-600 dark:text-gray-200">Use pelo menos 8 caracteres, misturando letras maiúsculas, minúsculas, números e símbolos</small>
            </div>
            <div className="mb-6">
              <label className="block mb-3 font-semibold text-black dark:text-white">Confirmar Nova Senha</label>
              <div className="relative">
                <input type={mostrarConfirmacao ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(253,77,121)] bg-[#f3f4f6] border border-pink-300 text-black dark:bg-gray-600 dark:border-gray-500 dark:text-white  dark:placeholder-white/65" placeholder="Confirme a nova senha" required pattern={passwordPattern} title={passwordTitle} />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacao(v => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label={mostrarConfirmacao ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'}
                >
                  {mostrarConfirmacao ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white py-3 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg">Atualizar Senha</button>
          </form>
        )}
      </div>
    </section>
  );
}

const Profile = () => {
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || '/assets/avatars/india-avatar.png');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAvatarList, setShowAvatarList] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('Nome do Usuário');
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [usuarioId, setUsuarioId] = useState('');

  const siteAvatars = [
    '/assets/avatars/india-avatar.png',
    '/assets/avatars/dinossauro-avatar.png',
    '/assets/avatars/menina-avatar.png',
    '/assets/avatars/menina-cacheada-avatar.png',
    '/assets/avatars/menino-avatar.png'
  ];

  useEffect(() => {
    (async () => {
      try {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        const usuarioIdLocal = localStorage.getItem('usuarioId');
        console.log('Perfil: usuarioLogado(localStorage)=', usuarioLogado, 'usuarioId(localStorage)=', usuarioIdLocal);

        if (!usuarioLogado) {
          console.error('Nenhum usuário logado encontrado no localStorage');
          return;
        }

        // 1) Preferir o ID do localStorage (definido no login)
        if (usuarioIdLocal) {
          setUsuarioId(usuarioIdLocal);
          console.log('Perfil: usando usuarioId do localStorage:', usuarioIdLocal);
          try {
            const resp = await fetch(`${API_BASE}/api/usuarios/${usuarioIdLocal}`);
            if (resp.ok) {
              const u = await resp.json();
              setNomeUsuario(u?.nome || usuarioLogado);
            }
          } catch {}
          return;
        }

        // 2) Fallback: buscar na lista de usuários pelo username
        console.log('Fazendo requisição para obter usuários (fallback)...');
        const usuarios = await getItem('usuarios');
        console.log('Usuarios obtidos da API:', usuarios);

        if (!usuarios || !Array.isArray(usuarios)) {
          console.error('Dados de usuários inválidos:', usuarios);
          return;
        }

        const usuario = usuarios.find(u => u && u.usuario === usuarioLogado);
        console.log('Usuario encontrado (fallback):', usuario);

        if (usuario) {
          setNomeUsuario(usuario.nome || 'Nome do Usuário');
          if (usuario.id) {
            setUsuarioId(usuario.id);
            console.log('UsuarioId definido como (fallback):', usuario.id);
          } else {
            console.error('Usuario encontrado mas sem ID:', usuario);
          }
        } else {
          console.error('Usuario não encontrado na lista de usuários');
          console.log('Usuários disponíveis:', usuarios.map(u => u?.usuario));
        }
      } catch (e) {
        console.error('Erro ao buscar dados do usuário:', e);
      }
    })();
  }, []);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    if (!passwordRegex.test(newPassword)) return alert('A nova senha deve ter ao menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolos.');
    if (newPassword !== confirmPassword) return alert('As senhas não coincidem!');
    try {
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (!usuarioLogado) return alert('Usuário não encontrado.');
      const usuarios = await getItem('usuarios');
      const usuario = usuarios.find(u => u.usuario === usuarioLogado);
      if (!usuario) return alert('Usuário não encontrado.');

      try {
        await postItem('usuarios/login', { usuario: usuario.usuario, senha: currentPassword });
      } catch (err) {
        return alert('Senha atual incorreta!');
      }

      const response = await fetch(`${API_BASE}/api/usuarios/${usuario.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senha: newPassword }) });
      if (!response.ok) throw new Error('Erro ao atualizar senha.');
      alert('Senha alterada com sucesso!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setShowPasswordSection(false);
    } catch (e) { console.error('Erro ao alterar senha', e); alert('Erro ao alterar senha.'); }
  };

  const handleSalvarNome = async () => {
    try {
      if (!novoNome.trim()) return;
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      if (!usuarioLogado) return;
      const usuarios = await getItem('usuarios');
      const usuario = usuarios.find(u => u.usuario === usuarioLogado);
      if (!usuario) return;
      const response = await fetch(`${API_BASE}/api/usuarios/${usuario.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: novoNome }) });
      if (!response.ok) throw new Error('Falha ao atualizar nome');
      setNomeUsuario(novoNome); setEditandoNome(false);
    } catch (e) { console.error('Erro ao atualizar nome', e); alert('Não foi possível atualizar o nome.'); }
  };

  return (
    <div className="min-h-screen flex flex-col text-black dark:text-gray-200">
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl bg-[#d9dbe2] dark:bg-gray-800 rounded-xl my-8 shadow-lg backdrop-blur-sm">
        <AvatarSection
          profileImage={profileImage}
          siteAvatars={siteAvatars}
          showAvatarList={showAvatarList}
          onToggleList={() => setShowAvatarList(p => !p)}
          onSelectAvatar={av => { setProfileImage(av); localStorage.setItem('profileImage', av); setShowAvatarList(false); }}
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
          <FacialVerificationSection usuarioId={usuarioId} />
          <EventsSection usuarioLogado={localStorage.getItem('usuarioLogado')} />
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
