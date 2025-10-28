import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../services/apiBase';
import PrivateChat from '../components/PrivateChat';
import StatusMenu from '../components/StatusMenu';
import LayoutWrapper from '../components/LayoutWrapper';
import { Card, Button, Badge } from '../components/ui';

const STATUS = { 'Disponível': 'bg-green-500', 'Ausente': 'bg-yellow-500', 'Não perturbar': 'bg-red-600', 'Invisível': 'bg-gray-400' };

export default function Amigos() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const usuarioId = localStorage.getItem('usuarioId');
    const [currentUser, setCurrentUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendsError, setFriendsError] = useState(null);
    const [online, setOnline] = useState([]);
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [openFriend, setOpenFriend] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [renderAdd, setRenderAdd] = useState(false);
    const [activeTab, setActiveTab] = useState('online');
    const [requestInfo, setRequestInfo] = useState(null);
    const [requestSending, setRequestSending] = useState(false);
    const [groupChats, setGroupChats] = useState([]);
    const [openGroup, setOpenGroup] = useState(null);
    const [squadGames, setSquadGames] = useState({});

    useEffect(() => {
        let abort = false;
        (async () => {
            if (!(usuarioLogado || usuarioId)) { if (!abort) setLoading(false); return; }
            if (currentUser) { if (!abort) setLoading(false); return; }
            try {
                if (usuarioId) {
                    const r = await fetch(`${API_BASE}/api/usuarios/${usuarioId}`);
                    if (r.ok) { const u = await r.json(); if (!abort) { setCurrentUser(u); setLoading(false); return; } }
                }
                const r = await fetch(`${API_BASE}/api/usuarios`);
                if (r.ok) {
                    const d = await r.json();
                    const u = d.find(x => x.id === usuarioId || x.usuario === usuarioLogado || x.nome === usuarioLogado);
                    if (!abort) setCurrentUser(u || null);
                }
            } catch (e) { }
            if (!abort) setLoading(false);
        })();
        return () => { abort = true };
    }, [usuarioLogado, usuarioId, currentUser]);

    const fetchFriends = useCallback(async () => {
        if (!currentUser) return;
        try {
            setFriendsError(null);
            const r = await fetch(`${API_BASE}/api/social/friends/${currentUser.id}`);
            if (!r.ok) throw new Error('HTTP ' + r.status);
            setFriends(await r.json());
        } catch (e) { setFriendsError('Erro ao carregar amigos'); }
    }, [currentUser]);
    const fetchGroups = useCallback(async () => {
        if (!currentUser) return;
        try {
            const r = await fetch(`${API_BASE}/api/chat/groups?userId=${currentUser.id}`);
            if (r.ok) { const data = await r.json(); setGroupChats(data); }
        } catch (e) { }
    }, [currentUser]);
    const fetchSquadGames = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/api/squads`);
            if (!r.ok) return;
            const squads = await r.json();
            const map = {};
            squads.forEach(s => { if (s && s.id) map[s.id] = s.jogo || s.game || s.nomeJogo || ''; });
            setSquadGames(map);
        } catch (e) { }
    }, []);
    const fetchOnline = useCallback(async () => { try { const r = await fetch(`${API_BASE}/api/social/online`); if (r.ok) { const l = await r.json(); setOnline(l.filter(o => o.id !== currentUser?.id)); } } catch (e) { } }, [currentUser]);
    const fetchRequests = useCallback(async () => {
        if (!currentUser) return;
        try {
            const r = await fetch(`${API_BASE}/api/social/requests/${currentUser.id}`);
            if (r.ok) {
                const data = await r.json();
                const incoming = (data.incoming || []).map(fr => ({
                    ...fr,
                    senderId: fr.senderId || fr.fromUserId,
                    receiverId: fr.receiverId || fr.toUserId
                }));
                const outgoing = (data.outgoing || []).map(fr => ({
                    ...fr,
                    senderId: fr.senderId || fr.fromUserId,
                    receiverId: fr.receiverId || fr.toUserId
                }));
                setRequests({ incoming, outgoing });
                // coletar IDs para resolver nomes
                const ids = new Set();
                incoming.forEach(fr => { ids.add(fr.senderId); });
                outgoing.forEach(fr => { ids.add(fr.receiverId); });
                ids.delete(currentUser.id);
                ids.delete(undefined);
                ids.delete(null);
                // buscar somente IDs ainda não resolvidos
                const missing = [...ids].filter(id => !userNames[id]);
                if (missing.length) {

                    const fetched = await Promise.all(missing.map(async id => {
                        try { const ru = await fetch(`${API_BASE}/api/usuarios/${id}`); if (ru.ok) { const u = await ru.json(); return [id, (u.nome || u.usuario || id)]; } } catch (e) { }
                        return [id, id];
                    }));
                    setUserNames(prev => { const copy = { ...prev }; fetched.forEach(([i, n]) => { copy[i] = n; }); return copy; });
                }
            }
        } catch (e) { }
    }, [currentUser, userNames]);
    useEffect(() => { fetchFriends(); fetchOnline(); fetchRequests(); fetchGroups(); fetchSquadGames(); }, [fetchFriends, fetchOnline, fetchRequests, fetchGroups, fetchSquadGames]);

    useEffect(() => {
        if (showAdd) {
            setRenderAdd(true);
        } else {
            const t = setTimeout(() => setRenderAdd(false), 260);
            return () => clearTimeout(t);
        }
    }, [showAdd]);

    // Busca usuários
    useEffect(() => {
        if (!showAdd) { setResults([]); setSearchError(null); return; }
        const ctrl = new AbortController();
        const t = setTimeout(async () => {
            if (!search.trim() || !currentUser) { setResults([]); setSearchError(null); return; }
            setSearchLoading(true); setSearchError(null);
            try {
                const url = `${API_BASE}/api/social/search?q=${encodeURIComponent(search)}&exclude=${currentUser.id}`;
                const r = await fetch(url, { signal: ctrl.signal });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const data = await r.json();
                setResults(data);
            } catch (e) { if (e.name !== 'AbortError') setSearchError('Erro na busca'); }
            finally { if (!ctrl.signal.aborted) setSearchLoading(false); }
        }, 350);
        return () => { clearTimeout(t); ctrl.abort(); };
    }, [search, currentUser, showAdd]);


    async function sendRequest(toUserId) {
        if (!currentUser || requestSending) return;
        setRequestInfo(null);
        setRequestSending(true);
        try {
            const r = await fetch(`${API_BASE}/api/social/friend-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentUser.id, targetId: toUserId })
            });
            if (r.status === 201) {
                setRequestInfo('Pedido enviado.');
                fetchRequests();
            } else if (r.status === 409) {
                const data = await r.json().catch(() => ({}));
                setRequestInfo(data.error || 'Já existe um pedido.');
                fetchRequests();
            } else {
                const data = await r.json().catch(() => ({}));
                setRequestInfo(data.error || 'Erro ao enviar.');
            }
        } catch (e) {
            setRequestInfo('Falha de rede.');
        } finally {
            setRequestSending(false);
        }
    }
    async function actOnRequest(id, action) { try { const r = await fetch(`${API_BASE}/api/social/friend-request/${id}/${action}`, { method: 'POST' }); if (r.ok) { fetchRequests(); fetchFriends(); } } catch (e) { } }
    async function cancelRequest(id) {
        try {
            const r = await fetch(`${API_BASE}/api/social/friend-request/${id}`, { method: 'DELETE' });
            if (r.ok) { fetchRequests(); }
        } catch (e) { }
    }

    if (loading) return <div className="p-6">Carregando...</div>;
    if (!currentUser) return <div className="p-6">Perfil não encontrado</div>;

    const sorted = [...friends].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
    const onlineFriends = sorted.filter(f => online.some(o => o.id === f.id));
    const list = activeTab === 'online' ? onlineFriends : sorted;

    return (
        <LayoutWrapper variant="friends" className="py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <Badge variant="primary" size="lg" className="mb-4">
                        👥 Sistema de Amigos
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Conecte-se com <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">amigos</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-3xl mx-auto">
                        Encontre novos gamers, mantenha contato e forme sua rede de amigos
                    </p>
                </div>

                <Card variant="glass" className="h-[calc(100vh-20rem)] flex overflow-hidden">
                    <aside className="w-72 flex flex-col border-r border-white/20 bg-white/5">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
                            <h2 className="text-base md:text-lg font-semibold tracking-wide text-white">CONVERSAS</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbars-thin p-2 space-y-4 text-sm">
                            <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-white/60 mb-2">Grupos</p>
                                <div className="flex flex-col gap-2">
                                    {groupChats.map(g => (
                                        <button key={g.id} onClick={() => setOpenGroup(g)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-white/10 bg-white/5">
                                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs text-white font-semibold">{(g.name || '?').slice(0, 2).toUpperCase()}</div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block truncate font-medium text-sm md:text-base text-white">{g.name}</span>
                                                {squadGames[g.squadId] && (
                                                    <span className="block text-[10px] text-white/60 truncate">{squadGames[g.squadId]}</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-white/60">{g.members.length}</span>
                                        </button>
                                    ))}
                                    {!groupChats.length && <div className="text-[11px] text-white/60">Sem grupos</div>}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-semibold text-white/60 mb-2">Amigos</p>
                                <div className="flex flex-col gap-2">
                                    {sorted.map(f => (
                                        <button key={f.id} onClick={() => setOpenFriend(f)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-white/10 bg-white/5">
                                            <span className={`w-2 h-2 rounded-full ${STATUS[f.status] || STATUS['Invisível']}`}></span>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xs text-white font-semibold">
                                                {(f.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="truncate font-medium text-sm md:text-base text-white">{f.username}</span>
                                        </button>
                                    ))}
                                    {!sorted.length && <div className="text-[11px] text-white/60">Sem amigos</div>}
                                </div>
                            </div>
                        </div>
                    </aside>
                    <main className="flex-1 flex flex-col">
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/20 bg-white/10">
                            <h1 className="text-lg font-semibold text-white">Amigos</h1>
                            <StatusMenu userId={currentUser.id} onChange={() => { fetchOnline(); fetchFriends(); }} />
                            <div className="flex-1" />
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Tab value="online" active={activeTab} setActive={setActiveTab}>Online</Tab>
                                    <Tab value="todos" active={activeTab} setActive={setActiveTab}>Todos</Tab>
                                </div>
                                <Button 
                                    onClick={() => setShowAdd(s => !s)} 
                                    variant="primary" 
                                    size="sm"
                                >
                                    Adicionar amigo
                                </Button>
                            </div>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 border-b border-white/20 bg-white/5 ${showAdd ? 'animate-slide-fade-in max-h-[600px]' : 'animate-slide-fade-out max-h-0'} flex flex-col gap-6 ${!showAdd ? 'pointer-events-none' : ''}`}>
                            {renderAdd && (
                                <div className="p-6 flex flex-col gap-6" aria-hidden={!showAdd}>
                                    <div>
                                        <h3 className="font-semibold mb-4 text-white">Pedidos de amizade</h3>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <h4 className="font-semibold mb-2 text-white">Pedidos recebidos</h4>
                                                <ul className="space-y-2">
                                                    {requests.incoming.map(fr => (
                                                        <li key={fr.id} className="flex items-center bg-white/10 px-3 py-2 rounded-md">
                                                            <span className="flex-1 truncate text-sm text-white">{userNames[fr.senderId] || fr.senderId}</span>
                                                            <div className="flex gap-1 w-32 justify-end">
                                                                <button onClick={() => actOnRequest(fr.id, 'accept')} className="text-[10px] px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400" aria-label="Aceitar pedido">Aceitar</button>
                                                                <button onClick={() => actOnRequest(fr.id, 'decline')} className="text-[10px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Recusar</button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                    {!requests.incoming.length && <li className="text-xs text-white/60">Nenhum</li>}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2 text-white">Pedidos enviados</h4>
                                                <ul className="space-y-2">
                                                    {requests.outgoing.map(fr => (
                                                        <li key={fr.id} className="flex items-center bg-white/10 px-3 py-2 rounded-md min-h-[42px] gap-2">
                                                            <span className="flex-1 truncate text-sm text-white">{userNames[fr.receiverId] || fr.receiverId}</span>
                                                            <button onClick={() => cancelRequest(fr.id)} className="text-[10px] px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white">Cancelar</button>
                                                        </li>
                                                    ))}
                                                    {!requests.outgoing.length && <li className="text-xs text-white/60">Nenhum</li>}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-white/20 pt-4">
                                        <h4 className="font-semibold mb-3 text-sm text-white">Adicionar novo amigo</h4>
                                        <div className="mb-3">
                                            <label htmlFor="amigos-busca-usuario" className="sr-only">Buscar usuário</label>
                                            <input id="amigos-busca-usuario" aria-label="Buscar usuário" value={search} onChange={e => { setSearch(e.target.value); setRequestInfo(null); }} placeholder="Buscar por Usuario" className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/20 focus:outline-none text-sm text-white placeholder-white/60" />
                                        </div>
                                        {requestInfo && (
                                            <p className={`text-[11px] mb-2 ${requestInfo.startsWith('Falha') || requestInfo.startsWith('Erro') ? 'text-red-400' : 'text-green-400'}`}>{requestInfo}</p>
                                        )}
                                        {searchLoading && <p className="text-xs text-white/60 mb-2">Buscando...</p>}
                                        {searchError && <p className="text-xs text-red-400 mb-2">{searchError}</p>}
                                        <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
                                            {results.map(r => (
                                                <li key={r.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-white/10">
                                                    <span className="text-white">{r.username}</span>
                                                    <button onClick={() => sendRequest(r.id)} disabled={requestSending} className="text-xs px-3 py-1 rounded bg-pink-800 hover:bg-pink-800 disabled:opacity-50 disabled:cursor-not-allowed text-white">{requestSending ? '...' : 'Enviar'}</button>
                                                </li>
                                            ))}
                                            {search && !results.length && !searchLoading && !searchError && <li className="text-xs text-white/60 px-1">Sem resultados</li>}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbars-thin p-6">
                            <h2 className="text-xs uppercase tracking-wider font-semibold text-white/60 mb-4">{activeTab === 'todos' ? 'Todos os amigos' : `Online — ${list.length}`}</h2>
                            {friendsError && <div className="text-xs text-red-400 mb-3">{friendsError}</div>}
                            <ul className="space-y-3">
                                {list.map(f => (
                                    <li key={f.id} className="flex items-center gap-5 bg-white/10 px-5 py-4 rounded-lg group relative">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-base">
                                                {(f.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white/70 ${STATUS[f.status] || STATUS['Invisível']}`}></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-base truncate text-white">{f.username}</p>
                                            <p className="text-xs mt-0.5 text-white/60">{f.status === 'Disponível' ? 'Online' : f.status}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <Button onClick={() => setOpenFriend(f)} variant="primary" size="sm">Mensagem</Button>
                                            <FriendActions friend={f} currentUser={currentUser} onRemoved={() => { fetchFriends(); }} />
                                        </div>
                                    </li>
                                ))}
                                {!list.length && <li className="text-xs text-white/60">Lista vazia</li>}
                            </ul>
                        </div>
                    </main>
                </Card>
            </div>
            {openFriend && <PrivateChat currentUser={currentUser} friend={openFriend} onClose={() => setOpenFriend(null)} />}
            {openGroup && <GroupChatModal group={openGroup} currentUser={currentUser} onClose={() => setOpenGroup(null)} />}
        </LayoutWrapper>
    );
}

function Tab({ value, active, setActive, children }) { const is = active === value; return <button onClick={() => setActive(value)} className={`px-3 py-1.5 rounded-md font-medium transition text-xs ${is ? 'bg-pink-600 text-white shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{children}</button>; }

function FriendActions({ friend, currentUser, onRemoved }) {
    const [open, setOpen] = useState(false);

    async function removeFriend() {
        try {
            const r = await fetch(`${API_BASE}/api/social/friends/${currentUser.id}/${friend.id}`, { method: 'DELETE' });
            if (r.ok) { setOpen(false); onRemoved?.(); }
        } catch (e) { }
    }

    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-lg leading-none">
                ···
            </button>
            {open && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 p-1 text-xs">
                    <button onClick={removeFriend} className="w-full text-left px-2 py-2 rounded hover:bg-red-50 dark:hover:bg-red-600/30 text-red-600 dark:text-red-400">Desfazer amizade</button>
                </div>
            )}
        </div>
    );
}

// Chat em grupo
function GroupChatModal({ group, currentUser, onClose }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    const resolveTimestamp = useCallback((message) => {
        if (!message) return Date.now();
        const parsed = message.time ? Date.parse(message.time) : NaN;
        if (Number.isFinite(parsed)) return parsed;
        const fromMessageId = Number(message.messageId);
        if (Number.isFinite(fromMessageId)) return fromMessageId;
        const numericLegacyId = Number(message.id);
        if (Number.isFinite(numericLegacyId)) return numericLegacyId;
        return Date.now();
    }, []);

    useEffect(() => {
        let int;
        async function load() {
            try {
                const r = await fetch(`${API_BASE}/api/chat/group/${group.id}/messages`);
                if (r.ok) {
                    const data = await r.json();
                    setMessages(data.map(m => {
                        const senderId = m.fromUserId ? m.fromUserId : m.id;
                        const ts = resolveTimestamp(m);
                        return ({
                            ...m,
                            id: senderId,
                            messageId: m.messageId || m.id,
                            username: m.username || m.nome || m.usuario || 'Usuário',
                            me: senderId === currentUser.id,
                            time: new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        });
                    }));
                }
            }
            catch (e) { }
            finally { setLoading(false); }
        }
        load();
        int = setInterval(load, 4000);
        return () => clearInterval(int);
    }, [group.id, currentUser.id, resolveTimestamp]);

    async function send() {
        if (!text.trim()) return;
        try {
            const body = { id: currentUser.id, username: currentUser.nome || currentUser.usuario, text: text.trim() };
            const r = await fetch(`${API_BASE}/api/chat/group/${group.id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (r.ok) {
                const saved = await r.json();
                const ts = resolveTimestamp(saved);
                setMessages(v => [...v, {
                    ...saved,
                    id: saved.id || currentUser.id,
                    messageId: saved.messageId || saved.id,
                    username: saved.username || body.username || 'Você',
                    me: true,
                    time: new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                }]);
                setText('');
            }
        } catch (e) { }
    }
    function handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-8">
            <div className="w-full sm:max-w-3xl lg:max-w-4xl h-[82vh] sm:h-[78vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="font-semibold truncate">Grupo: {group.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Integrantes: {group.members.length}</p>
                    </div>
                    <button onClick={onClose} className="px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Fechar</button>
                </header>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbars-thin" role="log" aria-live="polite" aria-label={`Mensagens do grupo ${group.name}`}>
                    {loading && <p className="text-sm text-gray-500">Carregando...</p>}
                    {!loading && !messages.length && <p className="text-sm text-gray-500">Nenhuma mensagem ainda.</p>}
                    {messages.map(m => (
                        <div key={m.messageId || m.id} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-xl px-4 py-2 text-sm shadow ${m.me ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{m.me ? 'Você' : m.username}</span>
                                    <span className="text-[10px] opacity-70">{m.time}</span>
                                </div>
                                <p className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                    <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-3 items-end">
                        <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey} placeholder="Mensagem" className="flex-1 resize-none rounded-lg bg-gray-100 dark:bg-gray-800 text-sm p-3 h-12 focus:outline-none border border-transparent focus:border-white dark:focus:border-white transition-colors" />
                        <button type="submit" disabled={!text.trim()} className="px-6 h-12 rounded-lg bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium hover:bg-pink-700 transition">Enviar</button>
                    </form>
                </div>
            </div>
        </div>
    );
}