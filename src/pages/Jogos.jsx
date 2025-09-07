import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from '../services/apiBase';
import SilentYouTube from "../components/SilentYouTube";
import { BsFilterRight } from "react-icons/bs";
const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Jogos() {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const destaques = games.slice(0, 5);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const next = () => setCarouselIndex(i => (i + 1) % destaques.length);
    const prev = () => setCarouselIndex(i => (i - 1 + destaques.length) % destaques.length);
    const srcSafe = (s) => (s ? encodeURI(s) : "");
    const isYouTube = url => /youtube\.com|youtu\.be/.test(url || '');
    const AUTOPLAY_MS = 5000;
    const autoplayRef = useRef(null);
    const isPausedRef = useRef(false);
    const pauseTimeoutRef = useRef(null);
    const startAutoplay = useCallback(() => {
        clearInterval(autoplayRef.current);
        if (!isPausedRef.current) {
            autoplayRef.current = setInterval(() => setCarouselIndex(i => (i + 1) % destaques.length), AUTOPLAY_MS);
        }
    }, [destaques.length]);
    const stopAutoplay = () => { clearInterval(autoplayRef.current); autoplayRef.current = null; };
    const pauseAutoplayTemporarily = (ms = AUTOPLAY_MS) => {
        isPausedRef.current = true;
        stopAutoplay();
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = setTimeout(() => { isPausedRef.current = false; startAutoplay(); }, ms);
    };
    useEffect(() => { startAutoplay(); return () => { stopAutoplay(); clearTimeout(pauseTimeoutRef.current); }; }, [startAutoplay]);
    useEffect(() => { if (!isPausedRef.current) { stopAutoplay(); startAutoplay(); } }, [carouselIndex, startAutoplay]);
    const containerRef = useRef(null);
    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const threshold = 60;
    const onPointerDown = (e) => { try { if (e.target.closest('button, input, a')) return; } catch { } if (e.pointerType === 'mouse' && e.button !== 0) return; draggingRef.current = true; startXRef.current = e.clientX ?? 0; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { } pauseAutoplayTemporarily(); };
    const onPointerMove = (e) => { if (!draggingRef.current) return; const delta = (e.clientX ?? 0) - startXRef.current; if (delta > threshold) { draggingRef.current = false; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { } prev(); } else if (delta < -threshold) { draggingRef.current = false; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { } next(); } };
    const onPointerUp = (e) => { if (!draggingRef.current) { try { e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); } catch { } return; } draggingRef.current = false; try { e.currentTarget.releasePointerCapture && e.currentTarget.releasePointerCapture(e.pointerId); } catch { } pauseAutoplayTemporarily(); };
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const allCategories = [...new Set(games.flatMap(g => g.categories))];
    const filteredGames = games.filter(g => { const matchesName = normalize(g.name).includes(normalize(search)) || normalize(g.desc).includes(normalize(search)); const matchesCategory = selectedCategories.length === 0 || g.categories.some(cat => selectedCategories.includes(cat)); return matchesName && matchesCategory; });
    const filteredCategories = allCategories.filter(cat => normalize(cat).includes(normalize(categorySearch)));
    useEffect(() => { fetch(`${API_BASE}/api/games`).then(r => r.json()).then(setGames).catch(err => console.error('Erro ao buscar jogos:', err)); }, []);
    return (
        <section className="min-h-screen pt-8 px-4">
            <header>
                <div className="mb-24 flex justify-center mx-auto">
                    <div ref={containerRef} className="relative w-full max-w-[1400px] rounded-2xl overflow-hidden shadow-2xl" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onMouseEnter={() => { isPausedRef.current = true; stopAutoplay(); }} onMouseLeave={() => { isPausedRef.current = false; startAutoplay(); }}>
                        <div className="relative w-full h-[500px] md:h-[650px]">
                            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${carouselIndex * 100}%)` }}>
                                {destaques.map(d => (
                                    <div key={d.id} className="flex-shrink-0 w-full h-[500px] md:h-[650px] relative">
                                        {d.video ? (isYouTube(d.video) ? <SilentYouTube url={d.video} title={d.name} className="w-full h-full" poster={d.image} /> : <video src={srcSafe(d.video)} autoPlay muted loop playsInline className="w-full h-full object-cover rounded-2xl" aria-label={`Vídeo mostrando o jogo ${d.name}`} />) : (d.image && <img src={srcSafe(d.image)} alt={d.name} className="w-full h-full object-cover rounded-2xl" />)}
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex items-center gap-2 z-50 ">
                                            {destaques.map((_, i) => (
                                                <button tabIndex={-1} key={i} onClick={() => { setCarouselIndex(i); pauseAutoplayTemporarily(); }} className={`w-3 h-3 md:w-3 md:h-3 rounded-full transition-all ${i === carouselIndex ? 'scale-150 bg-pink-600' : 'bg-white/60'}`} aria-label={`Ir para destaque ${i + 1}`} />
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 rounded-2xl pointer-events-none z-10">
                                            <div className="pointer-events-auto">
                                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">{d.name}</h2>
                                                <button className="bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white font-semibold px-8 py-3 rounded-full w-max transition pointer-events-auto" onClick={() => navigate(`/jogos/${d.id}`)} aria-label={`Ver jogo ${d.name}`}>Ver jogo</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <aside>
                <div className="max-w-[1440px] px-4 mb-6 flex flex-col md:flex-row items-center gap-4 relative mx-[13%]">
                    <input type="text" placeholder="Pesquisar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="p-3 rounded-lg text-black bg-slate-200 border border-gray-300 flex-1 " />
                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-1 rounded-lg  hover:bg-pink-600/30 border border-gray-300 dark:border-gray-600 flex items-center gap-2 hover:scale-105 transition" aria-label="Abrir filtro de categorias" aria-haspopup="true" aria-expanded={dropdownOpen}>
                            <BsFilterRight size={41} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 z-50">
                                <input type="text" placeholder="Pesquisar categorias..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} className="w-full p-2 mb-2 rounded-lg text-black border border-gray-300 dark:border-gray-600 " />
                                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                    {filteredCategories.map(cat => (
                                        <label key={cat} className="flex items-center gap-2 cursor-pointer" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]); } }}>
                                            <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className="accent-pink-600 w-4 h-4 rounded-sm border border-pink-600 cursor-pointer" aria-checked={selectedCategories.includes(cat)} />
                                            <span className="text-gray-800 dark:text-white">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
            <main>
                <div className="w-auto h-full px-4 mx-[13%]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center gap-4">
                        {filteredGames.map(g => (
                            <div
                                tabIndex={0}
                                key={g.id}
                                role="button"
                                aria-label={`Abrir página do jogo ${g.name}`}
                                onClick={() => navigate(`/jogos/${g.id}`)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/jogos/${g.id}`); } }}
                                className="game-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transition transform hover:scale-105 duration-300"
                            >
                                <div className="overflow-hidden rounded-t-2xl">
                                    <img src={srcSafe(g.image)} alt={`Capa do Jogo ${g.name}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-3">
                                    <h3 className="text-md font-bold mb-2 text-gray-900 dark:text-white">{g.name}</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {g.categories.map(cat => (
                                            <span key={cat} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-2 py-0.5 rounded-full text-xs">{cat}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </section>
    );
}

export default Jogos;
