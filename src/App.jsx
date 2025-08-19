import { useState } from "react";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Share2, Copy, History } from "lucide-react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [history, setHistory] = useState([]);

  // 🔹 Helper: Extract meaningful part of the question
  const extractTopic = (q) => {
    if (!q) return "";
    const words = q.split(" ");
    if (words.length <= 3) return q;
    return words.slice(2).join(" ");
  };

  const handleAsk = async (q) => {
    if (!q) return;
    setLoading(true);
    setAnswer("");
    setRelatedQuestions([]);

    try {
      const res = await fetch(
        `https://bible-ai-backend.onrender.com/ask?q=${encodeURIComponent(q)}`
      );
      const data = await res.json();

      if (data.answer) {
        setAnswer(data.answer);
        setHistory((prev) => [{ q, a: data.answer }, ...prev]);
      }
      if (data.related_questions) {
        setRelatedQuestions(data.related_questions);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (q) => {
    setQuestion(q);
    handleAsk(q);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    toast.success("Copied to clipboard!");
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Bible AI",
        text: answer,
        url: window.location.href,
      });
    } catch {
      toast.error("Sharing not supported");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-6">
      <Toaster richColors position="top-center" />

      <motion.h1
        className="text-4xl font-bold mb-6 text-blue-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Bible AI
      </motion.h1>

      {/* Input */}
      <div className="flex gap-2 w-full max-w-xl mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk(question)}
          placeholder="Ask a Bible question..."
          className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={() => handleAsk(question)}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50"
        >
          Ask
        </button>
      </div>

      {/* Answer */}
      <motion.div
        className="w-full max-w-xl p-4 bg-gray-900 rounded-2xl shadow-lg mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <p className="text-gray-400">Thinking...</p>
        ) : answer ? (
          <div>
            <p className="mb-3 whitespace-pre-line">{answer}</p>
            <div className="flex gap-4">
              <button onClick={handleCopy} className="flex items-center gap-1 text-sm hover:text-blue-400">
                <Copy size={16} /> Copy
              </button>
              <button onClick={handleShare} className="flex items-center gap-1 text-sm hover:text-blue-400">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Ask a question to see the answer.</p>
        )}
      </motion.div>

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="w-full max-w-xl bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">Try one of these:</h3>
          <div className="space-y-2">
            {relatedQuestions.map((rq, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(rq)}
                className="text-blue-400 hover:underline text-left block"
              >
                {extractTopic(rq)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-xl mt-6 bg-gray-900 p-4 rounded-2xl shadow-lg">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-2 text-green-400">
            <History size={18} /> History
          </h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((h, i) => (
              <li key={i} className="p-2 bg-gray-800 rounded-lg">
                <p className="font-medium">{h.q}</p>
                <p className="text-sm text-gray-300">{h.a}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
