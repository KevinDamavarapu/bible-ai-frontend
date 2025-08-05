// src/App.jsx
// ===============================================
// Bible AI Frontend - 17 Features Integrated
// ===============================================

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// === Feature 1: Backend API URL ===
const API_URL = "https://bible-ai-backend.onrender.com/bible";

export default function App() {
  // === Feature 2: State Management ===
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef(null);

  // === Feature 3: Suggested Questions ===
  const suggestedQuestions = [
    "What are the fruits of the Spirit?",
    "Tell me something about Moses",
    "Give me a verse about faith",
    "What does the Bible say about love?",
    "Who was King David?"
  ];

  // === Feature 4: Auto-scroll to latest answer ===
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  // === Feature 5: Submit Query to Backend ===
  const askBible = async (customQuery) => {
    const finalQuery = customQuery || query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await axios.post(API_URL, { query: finalQuery });
      // === Feature 6: Display Answer ===
      setAnswer(res.data.answer || "No answer received from the Bible AI.");
    } catch (err) {
      // === Feature 7: Error Handling ===
      setError("Failed to fetch answer, please try again.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* === Feature 8: Title === */}
      <h1 className="text-3xl font-bold text-indigo-700 mt-6 mb-2 text-center">
        Bible AI
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Ask the Bible anything and get instant answers.
      </p>

      {/* === Feature 9: Suggested Questions Buttons === */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => askBible(q)}
            className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-sm transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* === Feature 10: Input Box and Ask Button === */}
      <div className="flex w-full max-w-xl gap-2 mb-4">
        <input
          type="text"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Ask a question about the Bible..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askBible()}
        />
        <button
          onClick={() => askBible()}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>

      {/* === Feature 11: Answer Box with Auto-Scroll & Styling === */}
      <div
        ref={answerRef}
        className="w-full max-w-xl h-56 overflow-y-auto border border-gray-300 bg-white text-black rounded-lg p-3 shadow-md"
      >
        {loading && <p className="text-gray-500">Loading answer...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && answer && (
          <p className="whitespace-pre-wrap">{answer}</p>
        )}
        {!loading && !error && !answer && (
          <p className="text-gray-400">Your answer will appear here.</p>
        )}
      </div>

      {/* === Feature 12: Footer === */}
      <footer className="mt-6 text-gray-500 text-sm text-center">
        Powered by Bible AI | Responsive | Mobile-Friendly
      </footer>
    </div>
  );
}









