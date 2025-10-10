import { useEffect, useState, useRef } from 'react';
import { API_BASE } from '../services/apiBase';
import { Circle, Clock3, EyeOff, Minus, ChevronDown } from 'lucide-react';

// Mapeamento dos status
const STATUS_META = {
    'Disponível': { color: 'bg-green-500', icon: Circle },
    'Ausente': { color: 'bg-yellow-500', icon: Clock3 },
    'Não perturbar': { color: 'bg-red-600', icon: Minus },
    'Invisível': { color: 'bg-gray-400', icon: EyeOff }
};
const STATUS_ORDER = ['Disponível', 'Ausente', 'Não perturbar', 'Invisível'];

export default function StatusMenu({ userId, onChange }) {
    const [current, setCurrent] = useState('Disponível');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Carrega status atual
    useEffect(() => {
        let abort = false;
        async function load() {
            if (!userId) return;
            try { const r = await fetch(`${API_BASE}/api/social/status/${userId}`); if (r.ok) { const j = await r.json(); if (!abort) setCurrent(j.status); } } catch (e) { }
        }
        load();
        return () => { abort = true; };
    }, [userId]);

    async function selectStatus(st) {
        if (st === current) { setOpen(false); return; }
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE}/api/social/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, status: st })
            });
            if (r.ok) { setCurrent(st); onChange && onChange(st); }
        } catch (e) { }
        finally { setLoading(false); setOpen(false); }
    }

    const meta = STATUS_META[current];

    return (
        <div className="relative inline-block" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                disabled={!userId}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium disabled:opacity-50"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <span className={`w-3 h-3 rounded-full ${meta.color}`}></span>
                <span>{current}</span>
                <ChevronDown size={16} className="opacity-70" />
            </button>
            {open && (
                <div
                    role="menu"
                    aria-label="Selecionar status"
                    className="absolute z-40 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden py-2"
                >
                    {STATUS_ORDER.map(st => {
                        const m = STATUS_META[st];
                        const I = m.icon;
                        const active = st === current;
                        return (
                            <div key={st} role="none">
                                <button
                                    type="button"
                                    onClick={() => selectStatus(st)}
                                    disabled={loading}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition ${active ? 'bg-pink-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                                    role="menuitem"
                                >
                                    <span className={`w-3 h-3 rounded-full ${m.color}`}></span>
                                    <I size={16} />
                                    <span className="flex-1">{st}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}