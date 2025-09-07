import React, { useRef, useEffect } from 'react';

export default function ChatWindow({ channel, messages, hideScrollbar }) {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col rounded-xl overflow-hidden">
      <div
        id="chatMessages"
        ref={chatRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`Mensagens do canal ${channel}`}
        tabIndex={0}
  className={`flex-1 overflow-y-scroll p-6 rounded-xl focus:outline-none focus-none ${hideScrollbar ? 'scrollbar-hide' : 'custom-scrollbar'}`}
      >
        <ul className="space-y-4">
          {messages.map((msg, idx) => (
            <li
              key={msg.id || idx}
              className="flex items-start space-x-3 animate-fadeIn"
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
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words break-anywhere">{msg.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

