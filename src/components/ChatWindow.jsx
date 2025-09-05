import React, { useRef, useEffect } from 'react';

// Componente de janela de chat com melhorias de acessibilidade:
// - role="log" + aria-live para anunciar novas mensagens
// - lista semântica <ul>/<li>
// - cada mensagem com aria-label sintetizando remetente e horário
export default function ChatWindow({ channel, messages }) {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col rounded-xl overflow-hidden">
      <ul
        id="chatMessages"
        ref={chatRef}
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`Mensagens do canal ${channel}`}
        className="flex-1 overflow-y-auto p-6 space-y-4 rounded-xl"
      >
        {messages.map((msg, idx) => (
          <li
            key={msg.id || idx}
            className="flex items-start space-x-3 animate-fadeIn"
            aria-label={`${msg.username} às ${msg.time}`}
          >
            <div
              className={`w-10 h-10 bg-gradient-to-r ${msg.color} rounded-full flex items-center justify-center text-xs font-bold text-white uppercase`}
              aria-hidden="true"
            >
              {(msg.username || '')[0] || '?'}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-semibold ${msg.currentUser ? 'text-purple-400' : ''}`}>
                  {msg.username}
                </span>
                <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={msg.time}>
                  {`Hoje às ${msg.time}`}
                </time>
              </div>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{msg.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

