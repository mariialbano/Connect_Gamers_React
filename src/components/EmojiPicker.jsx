export default function EmojiPicker({ addEmoji }) {
    const emojis = ['😀', '😂', '😍', '😎', '😭', '👍', '🎮', '🔥', '❤️', '😜'];
    return (
        <div className="p-2 rounded-lg flex flex-wrap gap-2 mt-2 bg-white border border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-none transition-colors">
            {emojis.map(e => (
                <button
                    key={e}
                    className="text-2xl p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    onClick={() => addEmoji(e)}
                >
                    {e}
                </button>
            ))}
        </div>
    );
}
