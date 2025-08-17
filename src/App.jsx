import React, { useRef, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://bible-ai-wmlk.onrender.com";
const API_URL = `${API_BASE}/bible`;

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useState([]);

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
    "Explain the Ten Commandments",
  ];

  const fetchAnswer = async (customQuery = query) => {
    if (!customQuery.trim() || loading) return;

    setLoading(true);
    setAnswer("");
    setError("");
    setLastUpdated("");

    toast.loading("Thinking…", { id: "status" });

    try {
      const res = await axios.post(API_URL, null, {
        params: { query: customQuery },
        timeout: 20000,
      });

      if (res.data?.error) throw new Error(res.data.error);

      setAnswer(res.data?.answer || "No answer returned.");
      setLastUpdated(new Date().toLocaleTimeString());
      setRetryCount(0);
      setLoading(false);

      // update history (keep last 5 unique)
      setHistory((prev) => {
        const newHistory = [customQuery, ...prev.filter((q) => q !== customQuery)];
        return newHistory.slice(0, 5);
      });

      toast.success("Answer ready", { id: "status" });

      requestAnimationFrame(() => {
        answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      if (retryCount < 3) {
        const next = retryCount + 1;
        setRetryCount(next);
        toast.loading(`Waking backend… retry ${next}/3`, { id: "status" });
        setTimeout(() => fetchAnswer(customQuery), 3000);
      } else {
        setError("⚠️ Failed to fetch answer. Please try again.");
        setLoading(false);
        setRetryCount(0);
        toast.error("Failed to fetch answer. Please try again.", { id: "status" });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAnswer();
  };

  const copyToClipboard = () => {
    if (answer) {
      navigator.clipboard.writeText(answer);
      toast.success("Copied to clipboard");
    }
  };

  const shareAnswer = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bible AI", text: answer });
      } catch (err) {
        toast.error("Sharing cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="app-container">
      <Toaster position="top-center" />

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
          {loading ? "Thinking…" : "Ask"}
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

      {history.length > 0 && (
        <div className="history-box">
          <h3>Recent Questions:</h3>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                <button
                  className="history-btn"
                  onClick={() => {
                    setQuery(h);
                    fetchAnswer(h);
                  }}
                  disabled={loading}
                >
                  {h}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(answer || error) && (
        <div ref={answerRef} className="answer-box">
          {answer && (
            <>
              <strong>Answer:</strong>
              <p>{answer}</p>
              {lastUpdated && <small>🕒 Last updated: {lastUpdated}</small>}
              <div className="action-buttons">
                <button onClick={copyToClipboard} className="copy-btn">
                  📋 Copy
                </button>
                <button onClick={shareAnswer} className="share-btn">
                  🔗 Share
                </button>
              </div>
            </>
          )}
          {error && <div className="error-msg">{error}</div>}
        </div>
      )}
    </div>
  );
}
