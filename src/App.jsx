import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://bible-ai-backend.onrender.com/bible";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("idle");
  const answerRef = useRef(null);

  const suggestedQuestions = [
    "What are the fruits of the Spirit?",
    "Who was King Solomon?",
    "What does the Bible say about forgiveness?",
    "Explain Psalm 23",
    "What is the story of the Good Samaritan?",
  ];

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  const askBible = async (question) => {
    if (!question.trim()) return;
    setQuery(question);
    setLoading(true);
    setError("");
    setAnswer("");

    let retries = 3;
    while (retries > 0) {
      try {
        const res = await axios.post(
          API_URL,
          {},
          { params: { query: question }, timeout: 15000 }
        );
        setAnswer(res.data.answer || "No answer received.");
        setLoading(false);
        setBackendStatus("online");
        return;
      } catch (err) {
        retries--;
        setBackendStatus("waking");
        if (retries === 0) {
          setError("Failed to fetch answer. Please try again.");
          setLoading(false);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askBible(query);
  };

  return (
    <div className="app-container">
      <div className="background-watermark" />
      <header className="app-header">
        <h1>📖 Bible AI</h1>
        <p className="subtitle">Ask any Bible question and get instant answers.</p>
        {backendStatus === "waking" && (
          <p className="backend-status">⏳ Backend waking up, please wait...</p>
        )}
      </header>

      <form className="query-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a Bible question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Ask"}
        </button>
      </form>

      <div className="suggested-questions">
        {suggestedQuestions.map((q, idx) => (
          <button key={idx} onClick={() => askBible(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="answer-section" ref={answerRef}>
        {loading && (
          <div className="loader">
            <div className="spinner"></div>
            <p>Loading answer...</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        {!loading && answer && <p className="answer-text">{answer}</p>}
      </div>
    </div>
  );
}












