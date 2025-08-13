import React, { useState } from "react";
import axios from "axios";
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
    if (!customQuery.trim()) return;
    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await axios.post(API_URL, null, {
        params: { query: customQuery },
        timeout: 20000,
      });

      if (response.data.answer) {
        setAnswer(response.data.answer);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setAnswer("No answer returned.");
      }

      setRetryCount(0);
    } catch (err) {
      if (retryCount < 2) {
        setRetryCount(retryCount + 1);
        setAnswer("⏳ Backend might be waking up... Retrying...");
        setTimeout(() => fetchAnswer(customQuery), 3000);
      } else {
        setError("⚠️ Failed to fetch answer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAnswer();
  };

  return (
    <div className="app-container">
      <h1 className="title">📖 Bible AI</h1>
      <p className="subtitle">Ask anything about the Bible</p>

      <form className="input-section" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your question here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
        <button type="submit" disabled={loading} className="ask-button">
          {loading ? "⏳ Thinking..." : "Ask"}
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
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {answer && (
        <div className="answer-box">
          <strong>Answer:</strong>
          <p>{answer}</p>
          {lastUpdated && <small>🕒 Last updated: {lastUpdated}</small>}
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
