import React, { useRef, useEffect } from 'react';

export default function ChatWindow({ channel, messages, hideScrollbar, maxHeight, minHeight, height }) {
  const chatRef = useRef(null);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const containerStyle = {};
  if (height) containerStyle.height = typeof height === 'number' ? `${height}px` : String(height);
  if (maxHeight && !height) containerStyle.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : String(maxHeight);
  if (minHeight && !height) containerStyle.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : String(minHeight);

  const wrapperClass = `flex flex-1 flex-col rounded-xl overflow-hidden`;
  const scrollerClass = `flex-1 overflow-y-auto p-6 rounded-xl focus:outline-none focus-none ${hideScrollbar ? 'scrollbar-hide' : 'custom-scrollbar'}`;

  return (
    <div className={wrapperClass}>
      <div
        id="chatMessages"
        ref={chatRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`Mensagens do canal ${channel}`}
        tabIndex={0}
        className={scrollerClass}
        style={containerStyle}
      >
        <ul className="space-y-2">
          {messages.map((msg, idx) => (
            <li
              key={msg.messageId || msg.id || idx}
              className="flex items-start space-x-3 animate-fadeIn"
            >
              <div
                className={`w-10 h-10 bg-gradient-to-r ${msg.color} rounded-full flex items-center justify-center text-xs font-bold text-white uppercase`}
                aria-hidden="true"
              >
                {(msg.username || '')[0] || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`font-semibold ${msg.currentUser ? 'text-purple-400' : ''}`}>
                    {msg.username}
                  </span>
                  {msg.roleBadge && (
                    <span className="text-[10px] uppercase tracking-wide px-1.5 py-[2px] rounded-full bg-pink-600/25 dark:bg-pink-500/30 text-pink-700 dark:text-pink-200 leading-tight">
                      {msg.roleBadge}
                    </span>
                  )}
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

