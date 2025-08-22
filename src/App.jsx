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

  // --- Formatting helpers (no layout/color change) ---
  const verseRegex = /\b(?:[1-3]?\s?[A-Z][a-z]+)\s\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?\b/g;
  const boldTerms =
    /\b(God|Jesus|Christ|Holy\sSpirit|Spirit|faith|grace|love|hope|salvation|forgiveness)\b/gi;

  const escapeHtml = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatAnswerHtml = (text) => {
    if (!text) return "";
    const safe = escapeHtml(text.trim());

    // Split paragraphs by 2+ newlines
    const paragraphs = safe.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

    return paragraphs
      .map((p) => {
        // handle bullet points inside paragraph
        if (/^[-•]\s/m.test(p)) {
          const items = p
            .split(/\n/)
            .filter((line) => /^[-•]\s/.test(line))
            .map(
              (line) =>
                "<li>" +
                line
                  .replace(/^[-•]\s*/, "")
                  .replace(verseRegex, "<em>$&</em>")
                  .replace(boldTerms, "<strong>$&</strong>") +
                "</li>"
            )
            .join("");
          return `<ul>${items}</ul>`;
        }

        // normal paragraph
        let phtml = p
          .replace(verseRegex, "<em>$&</em>")
          .replace(boldTerms, "<strong>$&</strong>")
          .replace(/\n/g, "<br/>");
        return `<p>${phtml}</p>`;
      })
      .join("");
  };

  // --- Mini NLP topic extractor ---
  const extractTopics = (q, a) => {
    const text = (q + " " + (a || "")).toLowerCase();

    // candidate keywords (filter out common stopwords)
    const tokens = text.match(/\b[a-z]{3,}\b/g) || [];
    const stopwords = new Set([
      "what", "does", "the", "and", "for", "about", "with", "from", "that",
      "this", "who", "was", "are", "say", "tell", "story", "explain", "give",
      "into", "how", "can", "you", "next", "one", "sentence"
    ]);

    const freq = {};
    for (const t of tokens) {
      if (!stopwords.has(t)) {
        freq[t] = (freq[t] || 0) + 1;
      }
    }

    // pick top 2 frequent words as "topics"
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 2).map(([word]) => word);
  };

  const generateRelatedQuestions = (q, a) => {
    const topics = extractTopics(q, a);

    if (topics.length > 0) {
      return [
        `What key verses about ${topics.join(" and ")} should I read next?`,
        `How does the Bible apply ${topics[0]} to daily life?`,
        `Can you summarize ${topics.join(" and ")} in one sentence?`,
      ];
    }

    // fallback
    return [
      "What related verses support this?",
      "How can I apply this teaching today?",
      "Summarize this in one sentence.",
    ];
  };

  const fetchAnswer = async (customQuery = query) => {
    if (!customQuery.trim() || loading) return;

    setLoading(true);
    setAnswer("");
    setError("");
    setLastUpdated("");
    setRelatedQuestions([]);

    toast.loading("Thinking…", { id: "status" });

    try {
      const res = await axios.post(API_URL, null, {
        params: { query: customQuery },
        timeout: 20000,
      });

      if (res.data?.error) throw new Error(res.data.error);

      const text = res.data?.answer || "No answer returned.";
      setAnswer(text);
      setLastUpdated(new Date().toLocaleTimeString());
      setRetryCount(0);
      setLoading(false);

      // update history (keep last 5 unique)
      setHistory((prev) => {
        const newHistory = [customQuery, ...prev.filter((q) => q !== customQuery)];
        return newHistory.slice(0, 5);
      });

      // generate related questions based on query/answer
      setRelatedQuestions(generateRelatedQuestions(customQuery, text));

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
      } catch {
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
              <div
                className="formatted-answer"
                dangerouslySetInnerHTML={{ __html: formatAnswerHtml(answer) }}
              />
              {lastUpdated && <small>🕒 Last updated: {lastUpdated}</small>}

              <div className="action-buttons">
                <button onClick={copyToClipboard} className="copy-btn">
                  📋 Copy
                </button>
                <button onClick={shareAnswer} className="share-btn">
                  🔗 Share
                </button>
              </div>

              {relatedQuestions.length > 0 && (
                <div className="suggestions" style={{ marginTop: "0.75rem" }}>
                  <h3>Related questions:</h3>
                  <div className="suggestion-buttons">
                    {relatedQuestions.map((rq, idx) => (
                      <button
                        key={idx}
                        className="suggestion-btn"
                        disabled={loading}
                        onClick={() => {
                          setQuery(rq);
                          fetchAnswer(rq);
                        }}
                      >
                        {rq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div className="error-msg">{error}</div>}
        </div>
      )}
    </div>
  );
}
