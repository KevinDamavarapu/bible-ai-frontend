import React, { useState, useEffect } from "react";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [retryMessage, setRetryMessage] = useState("");
  const [lastAsked, setLastAsked] = useState(null);

  // ✅ Extract main topic from question
  const extractTopic = (question) => {
    const words = question.replace(/[?.!,]/g, "").split(" ");
    return words.slice(-1)[0]; // last word, cleaned
  };

  // ✅ Generate related questions
  const generateRelatedQuestions = (topic) => [
    `What key verses about ${topic} should I read next?`,
    `How does the Bible apply ${topic} to daily life?`,
    `Can you summarize ${topic} in one sentence?`,
  ];

  const fetchAnswer = async (q) => {
    setLoading(true);
    setRetryMessage("");
    try {
      const res = await fetch(
        `https://bible-ai-backend.onrender.com/ask?q=${encodeURIComponent(q)}`
      );

      if (res.status === 503) {
        setRetryMessage("Backend is waking up, please wait a few seconds...");
        toast("⏳ Backend waking up...");
        setTimeout(() => fetchAnswer(q), 5000);
        return;
      }

      const data = await res.json();
      setAnswer(data.answer);

      // ✅ Save to history
      setHistory((prev) => [
        { question: q, answer: data.answer },
        ...prev,
      ]);

      // ✅ Generate related questions
      const topic = extractTopic(q);
      setRelatedQuestions(generateRelatedQuestions(topic));

      setLastAsked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      toast("⚠️ Error fetching answer");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = () => {
    if (question.trim() !== "") {
      fetchAnswer(question);
      setQuestion("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    toast("📋 Answer copied!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("🔗 Link copied!");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Bible AI</h1>

      {/* Input */}
      <div className="flex space-x-2 w-full max-w-xl">
        <input
          type="text"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-grow border p-2 rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl"
        >
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {/* Retry message */}
      {retryMessage && (
        <p className="mt-2 text-yellow-600">{retryMessage}</p>
      )}

      {/* Answer */}
      {answer && (
        <div className="mt-6 p-4 border rounded-xl w-full max-w-xl shadow">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Answer</h2>
            <div className="flex space-x-2">
              <button onClick={handleCopy}>
                <Copy size={18} />
              </button>
              <button onClick={handleShare}>
                <Share2 size={18} />
              </button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-line">{answer}</p>
          {lastAsked && (
            <p className="text-xs text-gray-500 mt-2">
              Asked at {lastAsked}
            </p>
          )}
        </div>
      )}

      {/* Related Questions */}
      {relatedQuestions.length > 0 && (
        <div className="mt-4 w-full max-w-xl">
          <h3 className="font-semibold">Related Questions</h3>
          <ul className="list-disc list-inside text-blue-600">
            {relatedQuestions.map((rq, i) => (
              <li
                key={i}
                onClick={() => fetchAnswer(rq)}
                className="cursor-pointer hover:underline"
              >
                {rq}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 w-full max-w-xl">
          <h3 className="font-semibold">History</h3>
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="border p-2 rounded-xl">
                <p className="font-medium">Q: {h.question}</p>
                <p className="text-sm">A: {h.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
