import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../services/apiBase';
import { useTheme } from '../theme/ThemeContext';
import MessageInput from '../components/MessageInput';
import ChatWindow from '../components/ChatWindow';

const gradients = [
    'from-green-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-blue-400 to-cyan-500',
    'from-red-400 to-purple-500',
    'from-yellow-400 to-orange-500'
];
function colorFor(id) {
    if (!id) return gradients[0];
    let sum = 0; for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return gradients[sum % gradients.length];
}

export default function Comunidade() {
    const { theme } = useTheme();
    const [channels, setChannels] = useState([]);
    const [channel, setChannel] = useState('Geral');
    const [messages, setMessages] = useState([]);
    const [modError, setModError] = useState(null); // {message, reasons, severity}
    const pollingRef = useRef(null);
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const [currentUser, setCurrentUser] = useState(null);
    const [blockInfo, setBlockInfo] = useState(null); // { blocked, remainingMs, blockUntil }
    const [userMap, setUserMap] = useState({}); // mapa usuario(login) -> nome

    // Carrega usuário atual
    useEffect(() => {
        let abort = false;
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/usuarios`);
                if (!res.ok) return;
                const data = await res.json();
                if (abort) return;
                // construir mapa usuario -> nome
                const map = {};
                data.forEach(u => { if (u.usuario) map[u.usuario] = u.nome || u.usuario; });
                setUserMap(map);
                const user = data.find(u => u.usuario === usuarioLogado || u.nome === usuarioLogado);
                setCurrentUser(user || { usuario: usuarioLogado, nome: usuarioLogado, id: 'temp-' + usuarioLogado });
            } catch (e) { /* ignore */ }
        };
        if (usuarioLogado) load();
        return () => { abort = true; };
    }, [usuarioLogado]);

    const fetchChannels = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/chat/channels`);
            if (!res.ok) return;
            const data = await res.json();
            setChannels(data);
        } catch (e) { /* noop */ }
    }, []);

    const resolveTimestamp = useCallback((message) => {
        if (!message) return Date.now();
        const parsed = message.time ? Date.parse(message.time) : NaN;
        if (Number.isFinite(parsed)) return parsed;
        const numericId = Number(message.messageId);
        if (Number.isFinite(numericId)) return numericId;
        return Date.now();
    }, []);

    const fetchMessages = useCallback(async (ch) => {
        try {
            const res = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(ch)}`);
            if (!res.ok) return;
            const data = await res.json();
            const mapped = data.map(m => {
                const ts = resolveTimestamp(m);
                // Se o campo username for um login, substituir por nome amigável se existir
                const displayName = userMap[m.username] || m.username;
                const senderId = m.userId ? m.userId : m.id;
                return {
                    messageId: m.messageId || m.id,
                    id: senderId,
                    username: displayName,
                    text: m.text,
                    time: new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    color: colorFor(senderId),
                    currentUser: currentUser && senderId === currentUser.id
                };
            });
            setMessages(mapped);
        } catch (e) { /* noop */ }
    }, [currentUser, resolveTimestamp, userMap]);

    // Inicial
    useEffect(() => { fetchChannels(); }, [fetchChannels]);
    useEffect(() => { fetchMessages(channel); }, [channel, fetchMessages]);

    // Poll de bloqueio
    useEffect(() => {
        let interval; let abort = false;
        async function check() {
            if (!currentUser?.id) return;
            try {
                const res = await fetch(`${API_BASE}/api/chat/block-status/${currentUser.id}`);
                if (!res.ok) return;
                const data = await res.json();
                if (abort) return;
                if (data.blocked) {
                    setBlockInfo({ blocked: true, remainingMs: data.remainingMs, blockUntil: data.blockUntil });
                } else {
                    setBlockInfo(null);
                }
            } catch {/* ignore */ }
        }
        if (currentUser?.id) {
            check();
            interval = setInterval(check, 10000); // a cada 10s
        }
        return () => { abort = true; if (interval) clearInterval(interval); };
    }, [currentUser]);

    // Contagem regressiva local
    useEffect(() => {
        if (!blockInfo?.blocked) return;
        const t = setInterval(() => {
            setBlockInfo(info => {
                if (!info?.blocked) return info;
                const remaining = Math.max(info.blockUntil - Date.now(), 0);
                if (remaining <= 0) return null;
                return { ...info, remainingMs: remaining };
            });
        }, 1000);
        return () => clearInterval(t);
    }, [blockInfo?.blocked]);

    useEffect(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(() => fetchMessages(channel), 4000);
        return () => clearInterval(pollingRef.current);
    }, [channel, fetchMessages]);

    async function handleSend(msgText) {
        if (!currentUser) return alert('Faça login para enviar mensagens');
        if (blockInfo?.blocked) return; // não envia
        setModError(null);
        try {
            const body = {
                id: currentUser.id,
                // Prioriza nome, só cai para usuario se não houver nome
                username: currentUser.nome || currentUser.usuario || 'Usuário',
                text: msgText
            };
            const res = await fetch(`${API_BASE}/api/chat/messages/${encodeURIComponent(channel)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                if (res.status === 423) { // bloqueado
                    let data = {}; try { data = await res.json(); } catch { }
                    const remaining = Math.max((data.blockUntil || 0) - Date.now(), 0);
                    setBlockInfo({ blocked: true, blockUntil: data.blockUntil, remainingMs: remaining });
                    return;
                } else if (res.status === 400) {
                    let data = {}; try { data = await res.json(); } catch { }
                    setModError({ message: data.error || 'Mensagem recusada', reasons: data.reasons || [], severity: data.severity });
                    return; // não prossegue
                }
                throw new Error('Erro ao enviar');
            }
            const saved = await res.json();
            setMessages(prev => [...prev, {
                messageId: saved.messageId || saved.id,
                id: saved.id,
                username: userMap[saved.username] || saved.username,
                text: saved.text,
                time: new Date(resolveTimestamp(saved)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                color: colorFor(saved.id),
                currentUser: true
            }]);
            fetchChannels();
        } catch (e) {
            console.error(e);
        }
    }

    const headerBarClass = `border-b px-4 py-3 flex items-center justify-between ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`;

    return (
        <div className="min-h-screen w-full">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className={`flex h-[calc(100vh-10rem)] rounded-2xl shadow-lg overflow-hidden border transition-colors ${theme === 'dark'
                    ? 'bg-gray-900/70 border-gray-800'
                    : 'bg-gray-100/80 border-gray-300 backdrop-blur-sm'}`}>
                    {/* Lista de canais */}
                    <aside className={`w-60 hidden md:flex md:flex-col p-4 border-r transition-colors ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'} rounded-l-2xl`}>
                        <h2 className="text-base md:text-lg font-bold mb-3 ml-4" id="canalHeading">Canais</h2>
                        <div role="navigation" aria-labelledby="canalHeading" className="flex flex-col gap-2 pr-1">
                            {channels.map(c => {
                                const active = channel === c.name;
                                return (
                                    <button
                                        key={c.name}
                                        onClick={() => setChannel(c.name)}
                                        className={`text-left ml-2 pl-4 pr-4 py-2 rounded-lg transition font-medium text-xs ring-1 ring-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${active
                                            ? 'bg-pink-800 text-white shadow'
                                            : theme === 'dark'
                                                ? 'bg-gray-800/70 hover:bg-gray-800 text-gray-200'
                                                : 'bg-white hover:bg-white/90 text-gray-800 border border-gray-200'}`}
                                        aria-current={active ? 'page' : undefined}
                                    >
                                        {c.name}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>
                    {/* Chat principal */}
                    <div className="flex-1 flex flex-col rounded-r-2xl min-h-0">
                        <div className={`${headerBarClass} transition-colors ${theme === 'dark' ? 'bg-gray-900/60' : 'bg-white/70'} backdrop-blur-sm rounded-tr-2xl`}>
                            <h1 className="text-xl font-semibold">#{channel}</h1>
                        </div>
                        <div className={`flex-1 flex flex-col min-h-0 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900/40 to-gray-900/80' : 'bg-gradient-to-b from-white/60 to-white/90'} transition-colors`}>
                            {modError && (
                                <div className="mx-4 mb-2 p-3 rounded-lg text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700">
                                    <p className="font-semibold">{modError.message}</p>
                                    {modError.reasons?.length > 0 && (
                                        <p className="mt-1">Motivos: {modError.reasons.join(', ')} (gravidade {modError.severity})</p>
                                    )}
                                    <button onClick={() => setModError(null)} className="mt-2 text-xs underline">Fechar</button>
                                </div>
                            )}
                            <ChatWindow channel={channel} messages={messages} hideScrollbar />
                            <div className={`px-4 pt-2 pb-3 transition-colors ${theme === 'dark' ? 'bg-gray-900/70 border-gray-800 rounded-b-2xl' : 'bg-white/80 border-gray-300 rounded-b-2xl'} backdrop-blur-sm`}>
                                <MessageInput onSend={handleSend} blockInfo={blockInfo?.blocked ? { remainingMs: blockInfo.remainingMs } : null} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
