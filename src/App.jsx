import React, { useState } from "react";
import { Copy, Share2, Loader2 } from "lucide-react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [backendWaking, setBackendWaking] = useState(false);

  const formatBibleReferences = (text) => {
    // Regex to detect references like John 3:16 or 1 Corinthians 13:4-7
    const bibleRegex = /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+(-\d+)?)/g;
    return text.split(bibleRegex).map((part, i, arr) => {
      if (i % 4 === 1) {
        const book = arr[i];
        const chapter = arr[i + 1];
        const verse = arr[i + 2];
        const ref = `${book} ${chapter}:${verse}`;
        const urlBook = book.replace(/\s+/g, "");
        const url = `https://www.bible.com/bible/1/${urlBook}.${chapter}.${verse}`;
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            {ref}
          </a>
        );
      }
      return part;
    });
  };

  const extractTopic = (q) => {
    // Remove stopwords, keep key context words
    const stopwords = ["what", "is", "the", "of", "in", "a", "an", "to", "and", "about"];
    return q
      .split(" ")
      .filter((word) => !stopwords.includes(word.toLowerCase()))
      .slice(0, 5)
      .join(" ");
  };

  const handleAsk = async (customQuestion) => {
    const q = customQuestion || question;
    if (!q.trim()) return;

    setLoading(true);
    setAnswer("");
    setRelated([]);
    setCopied(false);
    setShared(false);

    // show backend waking toast if it takes time
    const wakingTimer = setTimeout(() => {
      setBackendWaking(true);
    }, 2000);

    try {
      const res = await fetch("https://bible-ai-backend.vercel.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      clearTimeout(wakingTimer);
      setBackendWaking(false);

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");

      const topic = extractTopic(q);
      setRelated([
        `What key verses about ${topic} should I read next?`,
        `How does the Bible apply ${topic} to daily life?`,
        `Can you summarize ${topic} in one sentence?`,
      ]);

      setHistory([{ q, a: data.answer }, ...history]);
      setQuestion("");
    } catch (error) {
      clearTimeout(wakingTimer);
      setBackendWaking(false);
      setAnswer("Error fetching answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Bible AI", text: answer });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Bible AI</h1>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask me a question..."
          className="border border-gray-400 rounded-l px-4 py-2 w-2/3"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-r"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Ask"}
        </button>
      </div>

      {backendWaking && (
        <p className="text-center text-gray-600 mb-4">
          ⏳ Waking up the backend, please wait...
        </p>
      )}

      {answer && (
        <div className="border border-gray-400 p-4 rounded mb-4 bg-black text-white">
          <p className="mb-4">{formatBibleReferences(answer)}</p>
          <div className="flex gap-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded"
            >
              <Copy size={16} />
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded"
            >
              <Share2 size={16} />
              {shared ? "Shared!" : "Share"}
            </button>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="border border-gray-400 p-4 rounded mb-4 bg-black text-white">
          <h2 className="font-semibold mb-2">Try one of these:</h2>
          <ul className="list-disc list-inside">
            {related.map((r, i) => (
              <li
                key={i}
                className="cursor-pointer hover:underline"
                onClick={() => handleAsk(r)}
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mb-4 underline"
      >
        {showHistory ? "Hide History" : "Show History"}
      </button>

      {showHistory && (
        <div className="space-y-4">
          {history.map((h, i) => (
            <div
              key={i}
              className="border border-gray-400 p-4 rounded bg-black text-white"
            >
              <p className="font-semibold">Q: {h.q}</p>
              <p className="mt-2">{formatBibleReferences(h.a)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
