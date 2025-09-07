import React, { useState } from 'react';
import { API_BASE } from '../services/apiBase';

const FAQ = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRatingChange = setRating;
  const handleMouseOver = setHoverRating;
  const handleMouseLeave = () => setHoverRating(0);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!feedback.trim() || feedback.trim().length < 5) {
      setError('Mínimo 5 caracteres');
      return;
    }
    if (rating < 1) {
      setError('Escolha uma nota (1 a 5)');
      return;
    }
    setSending(true);
    try {
  const resp = await fetch(`${API_BASE}/api/faq/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: feedback, rating })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(()=>({}));
        throw new Error(data.error || 'Falha ao enviar');
      }
  setSuccess('Enviado! Obrigado pelo feedback.');
      setFeedback('');
      setRating(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="my-28 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl h-auto bg-[#d9dbe2] dark:bg-gray-800/80 p-6 rounded-lg shadow-lg flex flex-col gap-6">
        <div className="flex-1 flex flex-col">
          <h2 className="text-3xl font-bold mb-4 text-center md:text-left text-black dark:text-white">
            Seu Feedback é importante para nós!
          </h2>
        <form onSubmit={handleFeedbackSubmit} className="flex flex-col flex-1 space-y-3">
          <div className="text-center">
            <p className="mb-2 text-lg text-black dark:text-white/80">
              Como você avalia sua experiência?
            </p>
            <div className="flex justify-center space-x-1 mb-7">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`text-2xl cursor-pointer ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => handleRatingChange(value)}
                  onMouseOver={() => handleMouseOver(value)}
                  onMouseLeave={handleMouseLeave}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea 
            className="w-full p-2 border border-gray-500 rounded focus:border-gray-500/80 focus:ring-1 focus:ring-gray-500/80 outline-none bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
            placeholder="Deixe seu comentário..."
            aria-label="Campo para comentário ou feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          ></textarea>

          <button 
            type="submit" 
            disabled={sending}
            className="w-full bg-pink-800 hover:bg-pink-900 disabled:opacity-60 disabled:cursor-not-allowed active:bg-pink-950 text-white py-2 px-4 rounded transition mt-0"
            aria-label="Enviar feedback"
          >
            {sending ? 'Enviando...' : 'Enviar Feedback'}
          </button>

          {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
          {success && <div className="text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-3 py-2 rounded" role="status">{success}</div>}
        </form>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
