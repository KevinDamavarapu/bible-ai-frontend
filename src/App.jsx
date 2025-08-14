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
    // IMPORTANT: do not reset retryCount here — only on success or final failure

    try {
      const response = await axios.post(API_URL, null, {
        params: { query: customQuery },
        timeout: 20000,
      });

      if (response.data?.error) throw new Error(response.data.error);

      setAnswer(response.data?.answer || "No answer returned.");
      setLastUpdated(new Date().toLocaleTimeString());

      // If we showed a "waking up" toast, close it and show success
      if (wakeToastId) {
        toast.dismiss(wakeToastId);
        setWakeToastId(null);
        toast.success("Backend is ready! Loading complete.");
      }

      setRetryCount(0);
      setLoading(false);

      // Smooth scroll to the answer once it's rendered
      requestAnimationFrame(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      // First failure => likely backend waking — show loading toast once
      if (retryCount === 0) {
        const id = toast.loading("⏳ Waking up the Bible AI backend…");
        setWakeToastId(id);
      }

      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        // Keep loading=true during retries
        setTimeout(() => fetchAnswer(customQuery), 3000);
      } else {
        // Final failure
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
    <div className="app-container">
      {/* Toast container */}
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      <h1 className="title">📖 Bible AI</h1>
      <p className="subtitle">Ask anything about the Bible</p>

      <form className="input-section" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
          disabled={loading}
          aria-busy={loading}
        />
        <button type="submit" disabled={loading} className="ask-button">
          {loading ? (
            <>
              <span className="loader" aria-hidden="true" />
              Thinking…
            </>
          ) : (
            "Ask"
          )}
        </button>
      </form>

      <div className="suggestions">
        <h3>Try one of these:</h3>
        <div className="suggestion-buttons">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(s);
                fetchAnswer(s);
              }}
              className="suggestion-btn"
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {(answer || error) && (
        <div ref={answerRef} className="answer-box fade-in">
          {answer && (
            <>
              <strong>Answer:</strong>
              <p>{answer}</p>
              {lastUpdated && <small>🕒 Last updated: {lastUpdated}</small>}
            </>
          )}
          {error && <div className="error-msg">{error}</div>}
        </div>
      )}
    </div>
  );
}
