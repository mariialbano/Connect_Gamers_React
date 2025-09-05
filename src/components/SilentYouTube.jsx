import { useState, useEffect, useRef } from 'react';

/**
 * SilentYouTube
 * Evita mostrar o overlay inicial do player (logo / controles) escondendo o iframe
 * até um pequeno delay após o onLoad. Usa pointer-events-none para impedir interação.
 * Mostra opcionalmente uma imagem de placeholder (thumb) enquanto isso.
 */
export default function SilentYouTube({ url, title, className = '', poster = '', delay = 650 }) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);
  const iframeRef = useRef(null);

  // Extrai ID do vídeo
  const extractId = (u) => {
    if (!u) return '';
    if (u.includes('youtu.be/')) return u.split('youtu.be/')[1].split(/[?&#]/)[0];
    const m = u.match(/[?&]v=([^&]+)/); if (m) return m[1];
    return '';
  };

  const id = extractId(url);
  const embed = id ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&modestbranding=1&rel=0&fs=0&playsinline=1&iv_load_policy=3` : url;

  useEffect(() => {
    return () => { clearTimeout(timeoutRef.current); };
  }, []);

  const handleLoad = () => {
    // Delay para garantir que o overlay inicial já sumiu
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>      
      {!visible && (
        poster ? (
          <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover rounded-2xl select-none pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-gray-900/40 animate-pulse rounded-2xl" aria-hidden="true" />
        )
      )}
      <iframe
        ref={iframeRef}
        title={title}
        src={embed}
        className={`w-full h-full rounded-2xl transition-opacity duration-300 pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}
        allow="autoplay; encrypted-media; picture-in-picture"
        loading="lazy"
        onLoad={handleLoad}
      />
    </div>
  );
}
