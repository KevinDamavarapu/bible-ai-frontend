import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);

  // --- Function to extract main topic from query ---
  const extractTopic = (query) => {
    if (!query) return "";

    // Lowercase for easier matching
    let q = query.toLowerCase();

    // Remove common prefixes
    const prefixes = [
      "what is",
      "what are",
      "who is",
      "who was",
      "tell me about",
      "explain",
      "define",
      "describe",
      "give me",
      "summarize",
      "how does",
      "how do",
      "can you",
      "could you",
    ];

    for (let prefix of prefixes) {
      if (q.startsWith(prefix)) {
        q = q.replace(prefix, "").trim();
        break;
      }
    }

    // Remove trailing question mark if present
    q = q.replace(/\?$/, "").trim();

    // Capitalize properly for display
    return q.charAt(0).toUpperCase() + q.slice(1);
  };

  const fetchAnswer = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setLoading(true);
    setAnswer("");
    toast.loading("Thinking...");

    try {
      const response = await fetch("https://bible-ai-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setAnswer(data.answer);

      // Save history
      setHistory((prev) => [
        { q: question, a: data.answer },
        ...prev.slice(0, 4),
      ]);

      // --- Generate related questions using extracted topic ---
      const topic = extractTopic(question);
      setRelatedQuestions([
        `What key verses about ${topic} should I read next?`,
        `How does the Bible apply ${topic} to daily life?`,
        `Can you summarize ${topic} in one sentence?`,
      ]);

      toast.dismiss();
      toast.success("Answer ready!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error fetching answer");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const shareAnswer = async (q, a) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Bible AI Answer",
          text: `Q: ${q}\n\nA: ${a}`,
        });
        toast.success("Shared successfully!");
      } catch {
        toast.error("Error sharing");
      }
    } else {
      copyToClipboard(`Q: ${q}\n\nA: ${a}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-4">Bible AI</h1>

      <div className="mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me a question..."
          className="border p-2 w-full"
        />
        <button
          onClick={fetchAnswer}
          disabled={loading}
          className="mt-2 bg-black text-white px-4 py-2"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="mb-6 p-4 bg-black text-white rounded-lg">
          <h2 className="font-semibold mb-2">Answer:</h2>
          <p className="mb-3">{answer}</p>

          <div className="flex space-x-3">
            <button
              onClick={() => copyToClipboard(answer)}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Copy
            </button>
            <button
              onClick={() => shareAnswer(question, answer)}
              className="bg-gray-700 px-3 py-1 rounded"
            >
              Share
            </button>
          </div>
        </div>
      )}

      {relatedQuestions.length > 0 && (
        <div className="mb-6 p-4 bg-black text-white rounded-lg">
          <h2 className="font-semibold mb-2">Related Questions:</h2>
          <ul className="list-disc list-inside space-y-1">
            {relatedQuestions.map((rq, idx) => (
              <li key={idx}>{rq}</li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 0 && (
        <div className="p-4 bg-black text-white rounded-lg">
          <h2 className="font-semibold mb-2">Recent Questions:</h2>
          <ul className="list-disc list-inside space-y-1">
            {history.map((h, idx) => (
              <li key={idx}>
                <strong>Q:</strong> {h.q}
                <br />
                <strong>A:</strong> {h.a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
