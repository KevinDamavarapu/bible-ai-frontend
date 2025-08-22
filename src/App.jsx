import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Share2, Clock } from "lucide-react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // --- Bible Reference Linker ---
  const makeBibleLinks = (text) => {
    const refRegex = /\b([1-3]?\s?[A-Za-z]+\s\d{1,3}:\d{1,3})\b/g;
    return text.replace(refRegex, (match) => {
      try {
        const [book, chapterVerse] = match.split(" ");
        const [chapter, verse] = chapterVerse.split(":");
        const bookCode = book
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 3); // crude short code
        return `<a href="https://www.bible.com/bible/111/${bookCode.toUpperCase()}.${chapter}.${verse}.NIV" target="_blank" class="text-blue-500 underline">${match}</a>`;
      } catch {
        return match;
      }
    });
  };

  // --- Fetch answer + related questions ---
  const fetchAnswer = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setRelatedQuestions([]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      const formattedAnswer = makeBibleLinks(data.answer || "");
      setAnswer(formattedAnswer);

      // Fix: extract related questions properly
      if (Array.isArray(data.related)) {
        const cleaned = data.related.map((q) =>
          q.replace(/^["']|["']$/g, "").trim()
        );
        setRelatedQuestions(cleaned);
      }

      // Save in history
      setHistory((prev) => [
        { question, answer: formattedAnswer, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      console.error(err);
      setAnswer("⚠️ Error fetching answer. Please try again.");
    }

    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer.replace(/<[^>]+>/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: answer.replace(/<[^>]+>/g, "") });
    } else {
      alert("Sharing not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex flex-col items-center">
      <motion.h1
        className="text-4xl font-bold mb-6 text-indigo-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Bible AI 📖✨
      </motion.h1>

      {/* Input */}
      <div className="flex gap-2 mb-6 w-full max-w-2xl">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAnswer()}
          className="flex-1 p-3 rounded-2xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          placeholder="Ask something about the Bible..."
        />
        <button
          onClick={fetchAnswer}
          className="px-5 py-3 bg-indigo-600 text-white rounded-2xl shadow hover:bg-indigo-700"
        >
          Ask
        </button>
      </div>

      {/* Answer Card */}
      {loading ? (
        <p className="text-gray-600 animate-pulse">⏳ Waking up backend...</p>
      ) : answer ? (
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="prose prose-indigo max-w-none"
            dangerouslySetInnerHTML={{ __html: answer }}
          />
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <Copy size={18} /> {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-indigo-600 hover:underline"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            🕒 Last updated: {new Date().toLocaleTimeString()}
          </p>
        </motion.div>
      ) : null}

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="mt-6 max-w-2xl w-full">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2">
            Related questions:
          </h2>
          <ul className="list-disc list-inside space-y-1 text-indigo-600">
            {relatedQuestions.map((q, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  fetchAnswer();
                }}
                className="cursor-pointer hover:underline"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 max-w-2xl w-full">
          <h2 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
            <Clock size={18} /> Recent Questions
          </h2>
          <ul className="space-y-2">
            {history.map((item, idx) => (
              <li
                key={idx}
                onClick={() => {
                  setQuestion(item.question);
                  setAnswer(item.answer);
                }}
                className="cursor-pointer bg-white p-3 rounded-xl shadow border hover:bg-indigo-50"
              >
                <p className="font-medium text-indigo-800">{item.question}</p>
                <p
                  className="text-sm text-gray-600 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
                <p className="text-xs text-gray-400">Asked at {item.time}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
