import React, { useRef, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

// Backend URL with Render fallback
const API_BASE =
  import.meta.env.VITE_API_URL || "https://bible-ai-wmlk.onrender.com";
const API_URL = `${API_BASE}/bible`;

// ========================
// Formatting & NLP Helpers
// ========================

// ✅ FIXED regex: handles multi-word book names like "Song of Solomon"
const verseRegex =
  /\b((?:[1-3]?\s?(?:[A-Z][a-z]+)(?:\s(?:of|the|and)\s[A-Z][a-z]+)*))\s+(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?\b/g;

const boldTerms =
  /\b(God|Jesus|Christ|Holy\sSpirit|Spirit|faith|grace|love|hope|salvation|forgiveness|sin|mercy|righteousness)\b/gi;

const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const youVersionSearchUrl = (book, chapter, verse, endVerse) => {
  const cleanBook = book.replace(/\s+/g, " ").trim();
  const ref = `${cleanBook} ${chapter}:${verse}${
    endVerse ? "-" + endVerse : ""
  }`;
  const q = encodeURIComponent(ref);
  return `https://www.bible.com/search/bible?query=${q}&version_id=111`;
};

const formatAnswerHtml = (text) => {
  if (!text) return "";
  const safe = escapeHtml(text.trim());
  const paragraphs = safe
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs
    .map((p) => {
      let chunk = p;
      chunk = chunk.replace(verseRegex, (m, book, ch, v, endV) => {
        const url = youVersionSearchUrl(book, ch, v, endV);
        const display = `${book} ${ch}:${v}${endV ? "-" + endV : ""}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer"><em>${display}</em></a>`;
      });
      chunk = chunk.replace(boldTerms, "<strong>$&</strong>");
      chunk = chunk.replace(/\n/g, "<br/>");
      return `<p>${chunk}</p>`;
    })
    .join("");
};

// Extracts a simple topic keyword
const extractTopic = (q) => {
  const words = q
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((w) => w.length > 3);
  if (!words.length) return "Bible";
  return words[0];
};

const buildRelated = (topic) => [
  `What key verses about ${topic} should I read next?`,
  `How does the Bible apply ${topic} to daily life?`,
  `Can you summarize ${topic} in one sentence?`,
];

// ========================
// Main Component
// ========================
export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, setHistory] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

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

  // ========================
  // Fetch answer
  // ========================
  const fetchAnswer = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");
    setRelatedQuestions([]);

    try {
      const res = await axios.post(API_URL, { query: q }, { timeout: 20000 });

      if (res.data && res.data.answer) {
        const formatted = formatAnswerHtml(res.data.answer);
        setAnswer(formatted);

        const newEntry = { q, a: formatted };
        setHistory((prev) => [newEntry, ...prev]);

        const topic = extractTopic(q);
        setRelatedQuestions(buildRelated(topic));

        setLastUpdated(new Date().toLocaleString());
        setRetryCount(0);

        setTimeout(() => {
          if (answerRef.current) {
            answerRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      } else {
        setError("No answer returned. Please try again.");
      }
    } catch (err) {
      console.error(err);
      if (retryCount < 3) {
        setRetryCount((c) => c + 1);
        toast("Retrying...", { icon: "⏳" });
        fetchAnswer(q);
      } else {
        setError("Failed to fetch answer. Please try again later.");
        toast.error("Server unavailable. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAnswer();
  };

  const copyToClipboard = () => {
    if (!answer) return;
    const plain = answer.replace(/<[^>]+>/g, "");
    navigator.clipboard.writeText(plain);
    toast.success("Copied!");
  };

  const shareAnswer = () => {
    if (!answer) return;
    if (navigator.share) {
      navigator
        .share({
          title: "Bible AI Answer",
          text: answer.replace(/<[^>]+>/g, ""),
        })
        .catch(() => {});
    } else {
      toast("Sharing not supported", { icon: "⚠️" });
    }
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="app-container">
      <Toaster position="top-center" />
      <h1 className="title">📖 Bible AI</h1>
      <p className="subtitle">Ask anything about the Bible</p>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="query-form">
        <input
          type="text"
          placeholder="Type your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="query-input"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {/* Suggestions */}
      <div className="suggestions">
        <p>Try:</p>
        <div className="suggestion-buttons">
          {suggestions.map((s, idx) => (
            <button key={idx} onClick={() => fetchAnswer(s)} className="s-btn">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <p className="error">{error}</p>}

      {/* Answer */}
      {answer && (
        <div className="answer-container" ref={answerRef}>
          <h2 className="answer-title">Answer</h2>
          <div
            className="answer-box"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
          <div className="answer-actions">
            <button onClick={copyToClipboard}>📋 Copy</button>
            <button onClick={shareAnswer}>🔗 Share</button>
          </div>
          {lastUpdated && (
            <p className="timestamp">Updated: {lastUpdated}</p>
          )}
        </div>
      )}

      {/* Related */}
      {relatedQuestions.length > 0 && (
        <div className="related-container">
          <h3>Related Questions</h3>
          <div className="related-buttons">
            {relatedQuestions.map((r, idx) => (
              <button
                key={idx}
                onClick={() => fetchAnswer(r)}
                className="related-btn"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="history-container">
          <h3>Previous Questions</h3>
          {history.map((item, idx) => (
            <div key={idx} className="history-entry">
              <p className="history-q">Q: {item.q}</p>
              <div
                className="history-a"
                dangerouslySetInnerHTML={{ __html: item.a }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
