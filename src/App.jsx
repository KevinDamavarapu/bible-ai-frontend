import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [relatedFromAnswer, setRelatedFromAnswer] = useState([]);
  const [newSuggestions, setNewSuggestions] = useState([]);

  const fetchAnswer = async (q) => {
    if (!q) return;
    setLoading(true);
    setAnswer("");
    setRelatedFromAnswer([]);
    toast.loading("Thinking...", { id: "thinking" });

    try {
      const res = await fetch("https://bible-ai-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();

      setAnswer(data.answer || "No answer found.");
      setHistory((prev) => [{ q, a: data.answer }, ...prev]);

      // Generate related Qs from the topic of the question
      const topic = extractTopic(q);
      setRelatedFromAnswer([
        `What key verses about ${topic} should I read next?`,
        `How does the Bible apply ${topic} to daily life?`,
        `Can you summarize ${topic} in one sentence?`,
      ]);

      // Generate new suggestions for variety
      setNewSuggestions([
        "What are the Ten Commandments?",
        "What does the Bible say about forgiveness?",
        "Who were the disciples of Jesus?",
      ]);

      toast.dismiss("thinking");
      toast.success("Answer ready!", { id: "answer-ready" });
    } catch (err) {
      console.error(err);
      toast.dismiss("thinking");
      toast.error("Error fetching answer.");
    }
    setLoading(false);
  };

  const extractTopic = (q) => {
    const words = q.split(" ");
    if (words.length <= 3) return q;
    return words.slice(-3).join(" ");
  };

  const handleAsk = () => {
    fetchAnswer(question);
    setQuestion("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    toast.success("Copied to clipboard!");
  };

  const handleShare = () => {
    const shareText = `${question}\n\n${answer}`;
    navigator.clipboard.writeText(shareText);
    toast.success("Answer + Question copied for sharing!");
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col items-center">
      <Toaster position="top-center" />

      <h1 className="text-3xl font-bold mb-4">Bible AI</h1>

      <div className="flex w-full max-w-xl space-x-2 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-400 rounded p-2"
          value={question}
          placeholder="Ask me a question"
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleAsk}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="w-full max-w-xl border border-gray-400 rounded p-4 mb-4">
          <p className="mb-2">{answer}</p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleCopy}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Copy
            </button>
            <button
              onClick={handleShare}
              className="bg-black text-white px-3 py-1 rounded"
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* Related Questions based on the Answer */}
      {relatedFromAnswer.length > 0 && (
        <div className="w-full max-w-xl border border-gray-400 rounded p-4 mb-4">
          <h2 className="font-semibold mb-2">Related Questions:</h2>
          {relatedFromAnswer.map((rq, idx) => (
            <p
              key={idx}
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => fetchAnswer(rq)}
            >
              {rq}
            </p>
          ))}
        </div>
      )}

      {/* New Suggestions Block */}
      {newSuggestions.length > 0 && (
        <div className="w-full max-w-xl border border-gray-400 rounded p-4">
          <h2 className="font-semibold mb-2">Try one of these:</h2>
          {newSuggestions.map((sq, idx) => (
            <p
              key={idx}
              className="cursor-pointer text-blue-600 hover:underline"
              onClick={() => fetchAnswer(sq)}
            >
              {sq}
            </p>
          ))}
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="w-full max-w-xl mt-6">
          <h2 className="font-semibold mb-2">History:</h2>
          {history.map((item, idx) => (
            <div
              key={idx}
              className="border border-gray-400 rounded p-2 mb-2 bg-black text-white"
            >
              <p className="font-bold">Q: {item.q}</p>
              <p>A: {item.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
