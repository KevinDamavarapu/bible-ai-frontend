import React, { useRef, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

// Use backend URL from .env
const API_URL = import.meta.env.VITE_API_URL + "/bible";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [wakeToastId, setWakeToastId] = useState(null);

  const answerRef = useRef(null);

  const suggestions = [
    "What are the fruits of the Spirit?",
    "Tell me about love in Song of Solomon",
    "Who was Moses?",
    "Explain the parable of the prodigal son",
    "What does the Bible say about forgiveness?",
    "Summarize the story of David and Goliath",
    "What is the Great Commission?",
    "Who were the 12 disciples?",
    "What is the meaning of faith in Hebrews 11?",
    "Explain the Ten Commandments"
  ];

  const fetchAnswer = async (customQuery = query) => {
    if (!customQuery.trim() || loading) return;

    setLoading(true);
    setAnswer("");
    setError("");
    setLastUpdated("");

    try {
      const response = await axios.post(API_URL, null, {
        params: { query: customQuery },
        timeout: 20000,
      });

      if (response.data?.error) throw new Error(response.data.error);

      setAnswer(response.data?.answer || "No answer returned.");
      setLastUpdated(new Date().toLocaleTimeString());

      if (wakeToastId) {
        toast.dismiss(wakeToastId);
        setWakeToastId(null);
        toast.success("Backend is ready! Loading complete.");
      }

      setRetryCount(0);
      setLoading(false);

      requestAnimationFrame(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      if (retryCount === 0) {
        const id = toast.loading("⏳ Waking up the Bible AI backend…");
        setWakeToastId(id);
      }

      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        setTimeout(() => fetchAnswer(customQuery), 3000);
      } else {
        if (wakeToastId) {
          toast.dismiss(wakeToastId);
          setWakeToastId(null);
        }
        setError("⚠️ Failed to fetch answer. Please try again.");
        toast.error("Failed to fetch answer. Please try again.");
        setLoading(false);
        setRetryCount(0);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAnswer();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 p-6">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <h1 className="text-4xl font-bold text-center mb-2">📖 Bible AI</h1>
      <p className="text-lg text-center text-gray-600 mb-6">Ask anything about the Bible</p>

      <form className="flex justify-center gap-2 mb-8" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 max-w-lg px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Thinking…
            </>
          ) : (
            "Ask"
          )}
        </button>
      </form>

      <div className="max-w-3xl mx-auto mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Try one of these:</h3>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s);
                fetchAnswer(s);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition disabled:opacity-50"
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(answer || error) && (
        <div
          ref={answerRef}
          className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-200 transition-opacity duration-300"
        >
          {answer && (
            <>
              <strong className="block mb-2 text-lg">Answer:</strong>
              <p className="mb-2 text-gray-700 leading-relaxed">{answer}</p>
              {lastUpdated && (
                <small className="text-gray-500 block">🕒 Last updated: {lastUpdated}</small>
              )}
            </>
          )}
          {error && <div className="text-red-500 font-semibold">{error}</div>}
        </div>
      )}
    </div>
  );
}
