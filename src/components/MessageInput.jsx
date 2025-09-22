import { useState, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';

export default function MessageInput({ onSend, blockInfo }) {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [remaining, setRemaining] = useState(null);

    useEffect(()=>{
        if(!blockInfo){ setRemaining(null); return; }
        function tick(){
            setRemaining(r=>{
                const ms = Math.max(blockInfo.remainingMs - (r?0:0), 0); // initialize
                return ms;
            });
        }
        tick();
    }, [blockInfo]);

    // Atualiza contador local a cada segundo se bloqueado
    useEffect(()=>{
        if(!blockInfo) return;
        const interval = setInterval(()=>{
            setRemaining(ms=>{
                const next = Math.max(ms - 1000, 0);
                return next;
            });
        },1000);
        return ()=> clearInterval(interval);
    }, [blockInfo]);

    function formatRemaining(ms){
        if(ms==null) return '';
        const totalSec = Math.ceil(ms/1000);
        const h = Math.floor(totalSec/3600);
        const m = Math.floor((totalSec%3600)/60);
        const s = totalSec%60;
        if(h>0) return `${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
        if(m>0) return `${m}m ${s.toString().padStart(2,'0')}s`;
        return `${s}s`;
    }

    function handleSend() {
        if (!text.trim()) return;
        onSend(text);
        setText('');
    }

    function handleKey(e){
        if(e.key==='Enter' && !e.shiftKey){
            e.preventDefault();
            handleSend();
        }
    }

    function addEmoji(e) {
        setText(prev => prev + e);
        setShowEmoji(false);
    }

    const blocked = !!blockInfo;
    return (
        <div className="relative bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-4 transition-colors">
            {blocked && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg bg-gray-900/80 backdrop-blur-sm text-center px-6">
                    <p className="text-sm md:text-base font-semibold text-amber-200">Você está temporariamente bloqueado</p>
                    <p className="mt-1 text-xs md:text-sm text-amber-300">Liberação em {formatRemaining(remaining ?? blockInfo.remainingMs)}</p>
                </div>
            )}
            <form onSubmit={e=>{e.preventDefault(); handleSend();}} className="flex items-end gap-3">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Digite sua mensagem..."
                    disabled={blocked}
                    className="flex-1 h-12 resize-none rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Campo de mensagem"
                    aria-describedby="msgHint"
                />
                <span id="msgHint" className="sr-only">Pressione Enter para enviar, Shift + Enter para nova linha.</span>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmoji(s => !s)}
                        disabled={blocked}
                        className="w-10 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-base flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label="Selecionar emoji"
                    >😊</button>
                    {showEmoji && (
                        <div className="absolute bottom-full mb-2 right-0 z-20 shadow-lg">
                            <EmojiPicker addEmoji={addEmoji} />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!text.trim() || blocked}
                    className="px-6 h-12 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    aria-label="Enviar mensagem"
                >Enviar</button>
            </form>
        </div>
    );
}

