import React, { useState } from 'react';
import { API_BASE } from '../services/apiBase';
import LayoutWrapper from '../components/LayoutWrapper';
import { Card, Button, Badge } from '../components/ui';

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
      // Obter informações do usuário logado
      const usuarioLogado = localStorage.getItem('usuarioLogado');
      const feedbackData = { 
        text: feedback, 
        rating,
        ...(usuarioLogado && { username: usuarioLogado })
      };

      const resp = await fetch(`${API_BASE}/api/faq/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
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
    <LayoutWrapper variant="faq" className="flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Badge variant="primary" size="lg" className="mb-4">
            💬 Feedback & Suporte
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sua opinião <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">importa</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Ajude-nos a melhorar a plataforma compartilhando sua experiência
          </p>
        </div>

        <Card variant="glass" className="p-8">
          <div className="flex-1 flex flex-col">
            <h2 className="text-3xl font-bold mb-4 text-center md:text-left text-neutral-900 dark:text-neutral-100">
              Seu Feedback é importante para nós!
            </h2>
            <form onSubmit={handleFeedbackSubmit} className="flex flex-col flex-1 space-y-3">
              <div className="text-center">
                <p className="mb-2 text-lg text-neutral-900 dark:text-neutral-100">
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
                          : 'text-neutral-600 dark:text-neutral-400'
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
                className="w-full p-2 border border-neutral-300 dark:border-neutral-600 rounded focus:border-primary-500 dark:focus:border-primary-400 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 outline-none bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                placeholder="Deixe seu comentário..."
                aria-label="Campo para comentário ou feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              ></textarea>

              <Button 
                type="submit" 
                variant="accent"
                size="lg"
                disabled={sending}
                className="w-full shadow-glow"
                aria-label="Enviar feedback"
              >
                {sending ? 'Enviando...' : '▶ Enviar Feedback'}
              </Button>

              {error && <div className="text-red-600 text-sm" role="alert">{error}</div>}
              {success && <div className="text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-300 px-3 py-2 rounded" role="status">{success}</div>}
            </form>
          </div>
        </Card>
      </div>
    </LayoutWrapper>
  );
};

export default FAQ;
