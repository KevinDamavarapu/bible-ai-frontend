import React, { useRef, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import "./App.css";

// Backend URL (Vercel/Vite .env) with Render fallback
const API_BASE =
  import.meta.env.VITE_API_URL || "https://bible-ai-wmlk.onrender.com";
const API_URL = `${API_BASE}/bible`;

// ---------- Formatting & NLP Helpers (layout/colors unchanged) ----------

// Basic scripture reference detector (handles multi-word books & ranges)
const verseRegex =
  /\b((?:[1-3]\s*)?(?:[A-Z][a-z]+(?:\s(?:of|the|and|[A-Z][a-z]+))*)?)\s+(\d{1,3}):(\d{1,3})(?:[-–](\d{1,3}))?\b/g;

// Key terms to bold (non-invasive visual emphasis)
const boldTerms =
  /\b(God|Jesus|Christ|Holy\sSpirit|Spirit|faith|grace|love|hope|salvation|forgiveness|sin|mercy|righteousness)\b/gi;

// Escape to safe HTML
const escapeHtml = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// Turn a reference match into a YouVersion (NIV = 111) search URL
const youVersionSearchUrl = (book, chapter, verse, endVerse) => {
  const ref = `${book} ${chapter}:${verse}${endVerse ? "-" + endVerse : ""}`;
  const q = encodeURIComponent(ref);
  // Reliable search endpoint (avoids per-book slug mapping)
  return `https://www.bible.com/search/bible?query=${q}&version_id=111`;
};

// Convert plain text to formatted HTML with clickable refs + emphasis
const formatAnswerHtml = (text) => {
  if (!text) return "";
  const safe = escapeHtml(text.trim());

  // Split into paragraphs on blank lines, keep line breaks inside paragraphs
  const paragraphs = safe.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const html = paragraphs
    .map((p) => {
      // 1) Emphasize verse references (italics) AND make them links
      let chunk = p;
      chunk = chunk.replace(verseRegex, (m, book, ch, v, endV) => {
        const url = youVersionSearchUrl(book, ch, v, endV);
        const display = `${book} ${ch}:${v}${endV ? "-" + endV : ""}`;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer"><em>${display}</em></a>`;
      });

      // 2) Bold key doctrinal terms
      chunk = chunk.replace(boldTerms, "<strong>$&</strong>");

      // 3) Convert single line breaks to <br/> inside a paragraph
      chunk = chunk.replace(/\n/g, "<br/>");

      return `<p>${chunk}</p>`;
    })
    .join("");

  return html;
};

// Mini-NLP topic extraction
const extractTopic = (q) => {
  if (!q) return "this topic";

  // Normalize
  let s = q.trim();

  // Prefer phrase after "about/on/of/regarding"
  const afterPreposition = s.match(
    /\b(?:about|on|of|regarding|concerning)\s+(.+)$/i
  );
  if (afterPreposition && afterPreposition[1]) {
    s = afterPreposition[1];
  }

  // If quoted phrase exists, use it
  const quoted = s.match(/["“”'‘’](.+?)["“”'‘’]/);
  if (quoted && quoted[1]) {
    s = quoted[1];
  }

  // Remove punctuation (keep spaces/hyphens)
  s = s.replace(/[^\w\s-]/g, " ");

  const stop = new Set([
    "what",
    "who",
    "whom",
    "whose",
    "when",
    "where",
    "why",
    "how",
    "is",
    "are",
    "am",
    "was",
    "were",
    "be",
    "being",
    "been",
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "and",
    "or",
    "for",
    "with",
    "from",
    "by",
    "about",
    "on",
    "as",
    "that",
    "this",
    "these",
    "those",
    "please",
    "explain",
    "tell",
    "me",
    "does",
    "do",
    "did",
    "can",
    "you",
    "give",
    "summarize",
    "explanation",
    "story",
    "parable",
  ]);

  // Tokenize
  const tokens = s
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  // Keep meaningful tokens
  const kept = tokens.filter((w) => {
    const lw = w.toLowerCase();
    if (stop.has(lw)) return false;
    if (lw.length <= 2) return false;
    // prune pure numbers unless likely a chapter/verse
    if (/^\d+$/.test(lw)) return false;
    return true;
  });

  // Prefer the longest contiguous chunk from the original string that includes kept tokens
  let topic = kept.join(" ").trim();

  // Fallbacks if we filtered too much
  if (!topic) {
    // Try capturing a noun-ish tail
    const tail = q.split(/\s+/).slice(-6).join(" ");
    topic = tail || q;
  }

  // Light tidy
  topic = topic.replace(/\s+/g, " ").trim();

  return topic || "this topic";
};

// Build three related follow-ups from topic
const buildRelated = (topic) => [
  `What key verses about ${topic} should I read next?`,
  `How does the Bible apply ${topic} to daily life?`,
  `Can you summarize ${topic} in one sentence?`,
];

// -----------------------------------------------------------------------

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

      // Update history (keep last 5 unique)
      setHistory((prev) => {
        const newHistory = [customQuery, ...prev.filter((q) => q !== customQuery)];
        return newHistory.slice(0, 5);
      });

      // Generate related questions using mini-NLP topic
      const topic = extractTopic(customQuery);
      setRelatedQuestions(buildRelated(topic));

      toast.success("Answer ready", { id: "status" });

      // Smooth scroll to the answer once it's rendered
      requestAnimationFrame(() => {
        answerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
        toast.error("Failed to fetch answer. Please try again.", {
          id: "status",
        });
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
      {/* Single toast host (center) */}
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

              {/* Formatted: paragraphs + clickable NIV links + bold terms */}
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

              {/* Related (uses existing blue pill buttons) */}
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
