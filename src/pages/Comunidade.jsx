import { useState, useEffect, useCallback, useRef } from 'react';
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
function colorFor(userId) {
    if (!userId) return gradients[0];
    let sum = 0; for (let i = 0; i < userId.length; i++) sum += userId.charCodeAt(i);
    return gradients[sum % gradients.length];
}

export default function Comunidade() {
    const { theme } = useTheme();
    const [channels, setChannels] = useState([]);
    const [channel, setChannel] = useState('Geral');
    const [messages, setMessages] = useState([]);
    const pollingRef = useRef(null);
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const [currentUser, setCurrentUser] = useState(null);

    // Carrega usuário atual
    useEffect(() => {
        let abort = false;
        const load = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/usuarios');
                if (!res.ok) return;
                const data = await res.json();
                if (abort) return;
                const user = data.find(u => u.usuario === usuarioLogado || u.nome === usuarioLogado);
                setCurrentUser(user || { usuario: usuarioLogado, id: 'temp-' + usuarioLogado });
            } catch (e) { /* ignore */ }
        };
        if (usuarioLogado) load();
        return () => { abort = true; };
    }, [usuarioLogado]);

    const fetchChannels = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/chat/channels');
            if (!res.ok) return;
            const data = await res.json();
            setChannels(data);
        } catch (e) { /* noop */ }
    }, []);

    const fetchMessages = useCallback(async (ch) => {
        try {
            const res = await fetch(`http://localhost:5000/api/chat/messages/${encodeURIComponent(ch)}`);
            if (!res.ok) return;
            const data = await res.json();
            const mapped = data.map(m => {
                const ts = m.timestamp || Date.parse(m.time) || Number(m.id) || Date.now();
                return {
                    id: m.id,
                    username: m.username,
                    userId: m.userId,
                    text: m.text,
                    time: new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    color: colorFor(m.userId),
                    currentUser: currentUser && m.userId === currentUser.id
                };
            });
            setMessages(mapped);
        } catch (e) { /* noop */ }
    }, [currentUser]);

    // Inicial
    useEffect(() => { fetchChannels(); }, [fetchChannels]);
    useEffect(() => { fetchMessages(channel); }, [channel, fetchMessages]);

    useEffect(() => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(() => fetchMessages(channel), 4000);
        return () => clearInterval(pollingRef.current);
    }, [channel, fetchMessages]);

    async function handleSend(msgText) {
        if (!currentUser) return alert('Faça login para enviar mensagens');
        try {
            const body = {
                userId: currentUser.id,
                username: currentUser.usuario || currentUser.nome || 'Usuário',
                text: msgText
            };
            const res = await fetch(`http://localhost:5000/api/chat/messages/${encodeURIComponent(channel)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error('Erro ao enviar');
            const saved = await res.json();
            setMessages(prev => [...prev, {
                id: saved.id,
                username: saved.username,
                userId: saved.userId,
                text: saved.text,
                time: new Date(saved.timestamp || Date.parse(saved.time) || Number(saved.id) || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                color: colorFor(saved.userId),
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
                    <div className="flex-1 flex flex-col rounded-r-2xl">
                        <div className={`${headerBarClass} transition-colors ${theme === 'dark' ? 'bg-gray-900/60' : 'bg-white/70'} backdrop-blur-sm rounded-tr-2xl`}>
                            <h1 className="text-xl font-semibold">#{channel}</h1>
                        </div>
                        <div className={`flex-1 flex flex-col ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900/40 to-gray-900/80' : 'bg-gradient-to-b from-white/60 to-white/90'} transition-colors`}>
                            <ChatWindow channel={channel} messages={messages} />
                            <div className={`px-4 pt-2 pb-3 transition-colors ${theme === 'dark' ? 'bg-gray-900/70 border-gray-800 rounded-b-2xl' : 'bg-white/80 border-gray-300 rounded-b-2xl'} backdrop-blur-sm`}>
                                <MessageInput onSend={handleSend} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
