import React, { useState } from 'react';

const FAQ = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Container do Feedback - Centralizado e com tamanho médio */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center text-black">
          Seu Feedback é importante para nós!
        </h2>

        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="text-center">
            <p className="mb-2 text-gray-700">Como você avalia sua experiência?</p>
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={`text-2xl cursor-pointer ${
                    (hoverRating || rating) >= value ? 'text-yellow-400' : 'text-gray-300'
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
            className="w-full p-2 border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
            placeholder="Deixe seu comentário..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          ></textarea>

          <button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded transition"
          >
            Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FAQ;
