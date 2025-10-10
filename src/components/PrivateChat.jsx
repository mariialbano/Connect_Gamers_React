import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE } from '../services/apiBase';
import EmojiPicker from './EmojiPicker';

const gradients = [
    'from-green-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-orange-400 to-red-500',
    'from-blue-400 to-cyan-500',
    'from-red-400 to-purple-500',
    'from-yellow-400 to-orange-500'
];
function colorFor(id = '') { let s = 0; for (let i = 0; i < id.length; i++) s += id.charCodeAt(i); return gradients[s % gradients.length]; }

export default function PrivateChat({ currentUser, friend, onClose }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [showEmoji,setShowEmoji] = useState(false);
    const pollRef = useRef(null);
    const bottomRef = useRef(null);

    const resolveTimestamp = useCallback((message) => {
        if (!message) return Date.now();
        const parsed = message.time ? Date.parse(message.time) : NaN;
        if (Number.isFinite(parsed)) return parsed;
        const numericMessageId = Number(message.messageId);
        if (Number.isFinite(numericMessageId)) return numericMessageId;
        const numericLegacyId = Number(message.id);
        if (Number.isFinite(numericLegacyId)) return numericLegacyId;
        return Date.now();
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!currentUser || !friend) return;
        try {
            const r = await fetch(`${API_BASE}/api/chat/private/${currentUser.id}/${friend.id}`);
            if (r.ok) {
                const data = await r.json();
                setMessages(data.map(m => {
                    const ts = resolveTimestamp(m);
                    const senderId = m.fromUserId ? m.fromUserId : m.id;
                    return {
                        messageId: m.messageId || m.id,
                        id: senderId,
                        username: m.username || m.nome || m.usuario || 'Usuário',
                        text: m.text,
                        time: new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        me: senderId === currentUser.id
                    };
                }));
            }
        } catch (e) {}
        finally { setLoading(false); }
    }, [currentUser, friend, resolveTimestamp]);

    useEffect(() => { fetchMessages(); }, [fetchMessages]);
    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(fetchMessages, 4000);
        return () => clearInterval(pollRef.current);
    }, [fetchMessages]);

    useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    async function send() {
        if (!text.trim()) return;
        try {
            const body = {
                id: currentUser.id,
                username: currentUser.nome || currentUser.usuario || 'Você',
                text: text.trim()
            };
            const r = await fetch(`${API_BASE}/api/chat/private/${currentUser.id}/${friend.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (r.ok) {
                const saved = await r.json();
                setMessages(prev => [...prev, {
                    messageId: saved.messageId || saved.id,
                    id: saved.id || currentUser.id,
                    username: saved.username || body.username || friend.username,
                    text: saved.text,
                    me: true,
                    time: new Date(resolveTimestamp(saved)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                }]);
                setText('');
            }
        } catch (e) {}
    }

    function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

    if (!friend) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-8">
            <div className="w-full sm:max-w-3xl lg:max-w-4xl h-[82vh] sm:h-[78vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="font-semibold">Chat com {friend.username}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mensagens privadas</p>
                    </div>
                    <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Fechar</button>
                </header>
                <div
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbars-thin focus:outline-none focus-none rounded-md"
                    tabIndex={0}
                    role="log"
                    aria-live="polite"
                    aria-label={`Histórico de mensagens privadas com ${friend.username}`}
                >
                    {loading && <p className="text-sm text-gray-500">Carregando...</p>}
                    {messages.map(m => (
                        <div key={m.messageId || m.id} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm shadow relative ${m.me ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r ${colorFor(m.id || '')} text-xs text-white font-semibold`}>{(m.username || '?')[0]}</span>
                                    <span className="font-medium">{m.me ? 'Você' : m.username}</span>
                                    <span className="text-[10px] opacity-70">{m.time}</span>
                                </div>
                                <p className="whitespace-pre-wrap break-words break-anywhere leading-relaxed">{m.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                    <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-3 items-end">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 resize-none rounded-lg bg-gray-100 dark:bg-gray-800 text-sm p-3 h-12 focus:outline-none border border-transparent focus:border-white dark:focus:border-white transition-colors"
                        />
            <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowEmoji(s => !s)}
                                className="w-10 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-base leading-none"
                                aria-label="Abrir seletor de emoji"
                            >😊</button>
                            {showEmoji && (
                                <div className="absolute bottom-full mb-2 right-0 z-20 shadow-lg">
                                    <EmojiPicker addEmoji={(e) => { setText(t => t + e); setShowEmoji(false); }} />
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="px-6 h-12 rounded-lg bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium hover:bg-pink-700 transition"
                        >Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}