import React, { useState } from 'react';

const FAQ = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleRatingChange = setRating;
  const handleMouseOver = setHoverRating;
  const handleMouseLeave = () => setHoverRating(0);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert("Obrigado pelo seu feedback!");
    setRating(0);
    setFeedback("");
  };

  return (
    <div className="my-24 flex items-center justify-center p-8">
      <div className="w-full max-w-xl h-auto min-h-[420px] bg-[#d9dbe2] dark:bg-gray-800/80 p-6 rounded-lg shadow-lg flex flex-col justify-between">
  <h2 className="text-3xl font-bold mb-4 text-center text-black dark:text-white">
          Seu Feedback é importante para nós!
        </h2>

        <form onSubmit={handleFeedbackSubmit} className="flex flex-col flex-1 justify-between space-y-2">
          <div className="text-center">
            <p className="mb-2 text-lg text-black dark:text-white/80">
              Como você avalia sua experiência?
            </p>
            <div className="flex justify-center space-x-1 mb-3">
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
            className="w-full bg-pink-800 hover:bg-pink-900 active:bg-pink-950 text-white py-2 px-4 rounded transition mt-0"
            aria-label="Enviar feedback"
          >
            Enviar Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default FAQ;
