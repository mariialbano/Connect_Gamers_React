import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';

const FAQ = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const { theme } = useTheme();

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleMouseOver = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert("Obrigado pelo seu feedback!");
    setRating(0);
    setFeedback("");
  };

  return (
    <div className="my-24 flex items-center justify-center p-8">
      {/* Container do Feedback - Centralizado e com tamanho médio */}
      <div className={
        theme === "dark"
          ? "w-full max-w-xl h-auto min-h-[420px] bg-gray-800/80 p-6 rounded-lg shadow-lg flex flex-col justify-between"
          : "w-full max-w-xl h-auto min-h-[420px] bg-[#d9dbe2] p-6 rounded-lg shadow-lg flex flex-col justify-between"
      }>
        <h2 className="text-3xl font-bold mb-4 text-center text-pink-500">
          Seu Feedback é importante para nós!
        </h2>

        <form onSubmit={handleFeedbackSubmit} className="flex flex-col flex-1 justify-between space-y-2">
          <div className="text-center">
            <p className={`mb-2 text-lg ${theme === "dark" ? "text-white/80" : "text-black/90"}`}>
              Como você avalia sua experiência?
            </p>
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`text-2xl cursor-pointer  ${
                    (hoverRating || rating) >= value
                      ? 'text-yellow-400'
                      : theme === "dark"
                        ? 'text-gray-300'
                        : 'text-gray-600' // cinza escuro no tema claro
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
              className={`w-full p-2 border border-gray-300 rounded focus:border-gray-500/80 focus:ring-1 focus:ring-gray-500/80 outline-none ${
              theme === "dark"
                ? "bg-gray-200 text-black"
                : "bg-gray-200 text-black"
            }`}
            placeholder="Deixe seu comentário..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          ></textarea>

          <button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded transition mt-0"
          >
            Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FAQ;
