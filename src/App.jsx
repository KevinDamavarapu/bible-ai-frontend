import React, { useState } from "react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [related, setRelated] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- Improved topic extraction for natural follow-ups ---
  const extractTopic = (q) => {
    if (!q) return "this topic";

    const cleaned = q
      .replace(
        /\b(tell me about|explain|what does|who is|who was|summarize|meaning of|define|describe)\b/gi,
        ""
      )
      .trim();

    const words = cleaned.split(/\s+/);
    if (words.length > 6) {
      return words.slice(-6).join(" ");
    }
    return cleaned || "this topic";
  };

  const fetchAnswer = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    setRelated([]);

    try {
      const res = await fetch(
        `https://bible-ai-backend.onrender.com/ask?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();

      setAnswer(data.answer || "No answer found.");
      setHistory((prev) => [
        { question: q, answer: data.answer },
        ...prev.slice(0, 9),
      ]);

      const topic = extractTopic(q);
      setRelated([
        `What key verses about ${topic} should I read next?`,
        `How does the Bible apply ${topic} to daily life?`,
        `Can you summarize ${topic} in one sentence?`,
      ]);
    } catch (err) {
      setAnswer("Error fetching answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = () => {
    if (question.trim()) {
      fetchAnswer(question);
      setQuestion("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    toast.success("Answer copied to clipboard!");
  };

  const handleShare = () => {
    const shareData = {
      title: "Bible AI Answer",
      text: answer,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(answer + " " + window.location.href);
      toast.success("Answer copied for sharing!");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Bible AI</h1>

        {/* Ask Box */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask me a question..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleAsk}
            className="px-4 py-2 bg-black text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>

        {/* Answer Box */}
        {answer && (
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <p>{answer}</p>
            <div className="flex space-x-4">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-sm text-gray-700"
              >
                <Copy size={16} /> <span>Copy</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-1 text-sm text-gray-700"
              >
                <Share2 size={16} /> <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* Related Questions */}
        {related.length > 0 && (
          <div className="p-3 border rounded-lg bg-black text-white space-y-2">
            <h2 className="font-semibold">Related Questions</h2>
            {related.map((r, i) => (
              <button
                key={i}
                onClick={() => fetchAnswer(r)}
                className="block text-left w-full hover:underline"
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Toggle History */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>

        {/* History */}
        {showHistory && (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="p-3 border rounded-lg bg-black text-white">
                <p className="font-semibold">Q: {h.question}</p>
                <p>A: {h.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
