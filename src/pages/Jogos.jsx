import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Jogos() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [eventos, setEventos] = useState({});
    const [rankings, setTopPlayers] = useState([]);
    const [chatMessages, setChatMessages] = useState([
        { user: "Organizador", text: "Evento em 10 minutos!" },
        { user: "Player1", text: "Irei participar!" }
    ]);
    const [chatInput, setChatInput] = useState("");

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch("http://localhost:5000/api/games").then(res => res.json()),
            fetch("http://localhost:5000/api/rankings").then(res => res.json()),
            fetch("http://localhost:5000/api/eventos").then(res => res.json())
        ])
            .then(([gamesData, playersData, eventosData]) => {
                setGames(gamesData);
                setTopPlayers(playersData.topPlayers || []);
                setEventos(eventosData || {});
                setLoading(false);
            })
            .catch(err => {
                setError("Erro ao carregar dados");
                setLoading(false);
            });
    }, []);

    const filteredGames = games.filter((game) => {
        const matchesName = game.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || game.categories.some((cat) => selectedCategories.includes(cat));
        return matchesName && matchesCategory;
    });

    const allCategories = [...new Set(games.flatMap((g) => g.categories))];

    const game = games.find((g) => g.id === gameId);

    const handleSendMessage = () => {
        if (chatInput.trim()) {
            setChatMessages([...chatMessages, { user: "Você", text: chatInput }]);
            setChatInput("");
        }
    };

    const handleClearFilters = () => {
        setSelectedCategories([]);
        setSearch("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-600"></div>
                <span className="ml-4 text-lg">Carregando...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-3xl font-bold text-red-600">{error}</h2>
                <button className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition" onClick={() => window.location.reload()}>
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (gameId && !game) {
        return (
            <div className="text-center mt-10">
                <h2 className="text-3xl font-bold">Jogo não encontrado</h2>
                <button className="mt-6 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition" onClick={() => navigate("/jogos")}> 
                    Voltar para jogos
                </button>
            </div>
        );
    }

    if (gameId && game) {
        const eventosDoJogo = gameId && eventos[game?.name] ? eventos[game.name] : [];

        return (
            <section className="min-h-screen px-8 py-12 flex justify-center" aria-labelledby="game-page-title">
                <div className="w-full max-w-7xl text-black dark:text-white">
                    {/* Imagem jogo */}
                    <header className="flex flex-col md:flex-row gap-6 mb-10 items-center" aria-label="Informações do jogo">
                        <img src={game.image} alt={game.name} className="w-full md:w-1/3 h-auto object-cover rounded-2xl " />
                        <div className="md:w-2/3 flex flex-col justify-center">
                            <h1 id="game-page-title" className="text-4xl md:text-5xl font-extrabold mb-4">{game.name}</h1>
                            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">{game.desc}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {game.categories.map((cat) => (
                                    <span key={cat} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm">{cat}</span>
                                ))}
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Rankings */}
                        <main className="lg:col-span-2 flex flex-col gap-6" aria-label="Eventos e rankings">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 min-h-[300px]">
                                <h2 className="text-2xl font-bold mb-4">Próximos Eventos</h2>
                                <ul className="list-disc list-inside space-y-3 text-gray-800 dark:text-gray-200 text-lg">
                                    {eventosDoJogo.length > 0 ? (
                                        eventosDoJogo.map(ev => (
                                            <li key={ev.id}>
                                                {ev.nome} - {ev.dia} - {ev.horario}
                                            </li>
                                        ))
                                    ) : (
                                        <li>Nenhum evento para este jogo.</li>
                                    )}
                                </ul>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                <h2 className="text-2xl font-bold mb-4">Top 5 Jogadores (KDR)</h2>
                                <ol className="space-y-2">
                                    {rankings.length > 0 ? (
                                        rankings.map((player, index) => (
                                            <li key={index} className="flex justify-between p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold shadow-sm">
                                                <span>{index + 1}. {player.name}</span>
                                                <span>{player.kdr.toFixed(2)}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li>Nenhum jogador encontrado.</li>
                                    )}
                                </ol>
                            </div>
                        </main>


                        {/* Chat */}
                        <aside className="flex flex-col gap-6" aria-label="Painel lateral: chat e interações">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 flex flex-col h-full">
                                <h2 className="text-2xl font-bold mb-4">Chat</h2>
                                <div
                                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 overflow-y-auto mb-3"
                                    aria-label="Mensagens do chat"
                                    role="log"
                                    aria-live="polite"
                                >
                                    {chatMessages.map((msg, idx) => (
                                        <p key={idx} className="text-sm"><strong>[{msg.user}]:</strong> {msg.text}</p>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Digite sua mensagem..."
                                        className="p-3 rounded-lg bg-gray-200 dark:bg-gray-600 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 flex-1"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                handleSendMessage();
                                            }
                                        }}
                                        aria-label="Digite sua mensagem"
                                    />
                                    <button
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
                                        onClick={handleSendMessage}
                                        aria-label="Enviar mensagem"
                                    >
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Botão Voltar */}
                    <div className="flex justify-center mt-10">
                        <button
                            className="bg-gray-600 hover:bg-pink-600/30 text-white px-6 py-3 rounded-xl hover:rounded-xl shadow-lg transition"
                            onClick={() => navigate("/jogos")}
                            aria-label="Voltar para jogos"
                        >
                            ← Voltar
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // Lista de jogos 
    return (
        <section className="min-h-screen px-8 py-12 flex flex-col items-center" aria-labelledby="games-list-title">
            <div className="w-full max-w-7xl text-black dark:text-white">
                {/* Header com busca e filtros */}
                <header className="flex flex-col md:flex-row gap-4 mb-8 items-center" aria-label="Busca e filtros de jogos">
                    <input
                        type="text"
                        placeholder="Pesquisar por nome..."
                        /* Foco acessível arredondado */
                        className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 flex-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Pesquisar por nome"
                    />
                    <div className="flex flex-wrap gap-2">
                                                {allCategories.map((cat) => {
                                                        const ativo = selectedCategories.includes(cat);
                                                        return (
                                                                <button
                                                                        key={cat}
                                                                        /* Paleta rosa para filtros: estado ativo forte, inativo suave; contraste AA */
                                                                        className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors
                                                                            ${ativo
                                                                                ? 'bg-pink-800 text-white border-pink-800 hover:bg-pink-900 active:bg-pink-950 dark:bg-pink-600 dark:border-pink-600 dark:hover:bg-pink-500'
                                                                                : 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 dark:bg-pink-600/20 dark:text-pink-300 dark:border-pink-500 dark:hover:bg-pink-600/30'}
                                                                            `}
                                                                        onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                                                                        aria-pressed={ativo}
                                                                        aria-label={`Filtrar por categoria ${cat}`}
                                                                    >
                                                                        {cat}
                                                                </button>
                                                        );
                                                })}
                        <button
                            className="px-4 py-2 rounded-full border bg-red-200 dark:bg-red-600 text-red-800 dark:text-white border-red-400"
                            onClick={handleClearFilters}
                            aria-label="Limpar filtros"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </header>

                {/* Main com lista de jogos */}
                <main aria-label="Lista de jogos">
                    <h2 id="games-list-title" className="sr-only">Lista de jogos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredGames.map(game => (
                            <article
                                key={game.id}
                                role="button"
                                tabIndex={0}
                                aria-label={`Abrir página do jogo ${game.name}`}
                                onClick={() => navigate(`/jogos/${game.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        navigate(`/jogos/${game.id}`);
                                    }
                                }}
                                /* Foco arredondado: ring rosa */
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 hover:shadow-lg transition cursor-pointer"
                            >
                                <img src={game.image} alt={game.name} className="w-full h-56 object-cover rounded-xl mb-4" />
                                <h3 className="text-2xl font-bold mb-3">{game.name}</h3>
                                {/* Descrição removida da listagem; exibida apenas na página de detalhe */}
                                <div className="flex flex-wrap gap-2">
                                    {game.categories.map(cat => <span key={cat} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm">{cat}</span>)}
                                </div>
                            </article>
                        ))}
                    </div>
                </main>
            </div>
        </section>
    );
}
