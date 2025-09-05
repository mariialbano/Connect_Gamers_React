import { useState } from 'react';
import EmojiPicker from './EmojiPicker';

export default function MessageInput({ onSend }) {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);

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

    return (
        <div className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 p-4 transition-colors">
            <form onSubmit={e=>{e.preventDefault(); handleSend();}} className="flex items-end gap-3">
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 h-12 resize-none rounded-lg bg-gray-100 border border-gray-300 text-sm text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-white transition-colors"
                    aria-label="Campo de mensagem"
                    aria-describedby="msgHint"
                />
                <span id="msgHint" className="sr-only">Pressione Enter para enviar, Shift + Enter para nova linha.</span>
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowEmoji(s => !s)}
                        className="w-10 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-base flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
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
                    disabled={!text.trim()}
                    className="px-6 h-12 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    aria-label="Enviar mensagem"
                >Enviar</button>
            </form>
        </div>
    );
}

