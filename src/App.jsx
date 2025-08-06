import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// ==============================
// CONFIGURATION
// ==============================
const API_URL = "https://bible-ai-backend.onrender.com/bible";

// Suggested starter questions
const SUGGESTED_QUESTIONS = [
  "What are the fruits of the Spirit?",
  "Tell me something about love in Song of Solomon",
  "Who was Moses in the Bible?",
  "What is the significance of the Last Supper?",
  "What are the Ten Commandments?"
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const answerRef = useRef(null);

  // ==============================
  // FEATURE 1: Auto-scroll to latest answer
  // ==============================
  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  // ==============================
  // FEATURE 2: Ask Bible AI function
  // ==============================
  const askBible = async (userQuestion, retryCount = 0) => {
    if (!userQuestion.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const res = await axios.post(API_URL, null, {
        params: { query: userQuestion },
        timeout: 15000, // 15s timeout
      });
      setAnswer(res.data.answer || "No answer received.");
    } catch (err) {
      console.error(err);
      if (retryCount < 2) {
        setError("Backend waking up... retrying");
        setTimeout(() => askBible(userQuestion, retryCount + 1), 3000);
      } else {
        setError("Failed to fetch answer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FEATURE 3: Handle Enter key press
  // ==============================
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      askBible(question);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-50 to-purple-100 p-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-purple-700 mt-4 mb-2">
        Bible AI
      </h1>
      <p className="text-gray-700 mb-4 text-center max-w-xl">
        Ask any question about the Bible and get an AI-powered answer.
      </p>

      {/* FEATURE 4: Suggested Questions */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuestion(q);
              askBible(q);
            }}
            className="px-3 py-2 bg-yellow-200 hover:bg-yellow-300 rounded text-sm text-black shadow"
          >
            {q}
          </button>
        ))}
      </div>

      {/* FEATURE 5: Input box */}
      <div className="flex gap-2 mb-4 w-full max-w-xl">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your question..."
          className="flex-1 p-2 border border-gray-300 rounded shadow focus:outline-none"
        />
        <button
          onClick={() => askBible(question)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow"
        >
          Ask
        </button>
      </div>

      {/* FEATURE 6: Loading indicator */}
      {loading && <p className="text-blue-600 mb-2">⏳ Loading answer...</p>}

      {/* FEATURE 7: Error message */}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      {/* FEATURE 8: Answer box with autoscroll */}
      <div
        ref={answerRef}
        className="w-full max-w-xl bg-white border border-gray-300 rounded shadow p-4 overflow-y-auto max-h-96 whitespace-pre-wrap text-gray-800"
      >
        {answer || (!loading && !error && "Ask a question to see the answer here.")}
      </div>

      {/* FEATURE 9: Responsive & Mobile Friendly */}
      <footer className="text-xs text-gray-500 mt-6">
        Powered by FastAPI + OpenAI | Bible AI Project
      </footer>
    </div>
  );
}











