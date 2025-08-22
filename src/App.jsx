import { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [related, setRelated] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [recent, setRecent] = useState([]);

  // --- Format answer: bold + Bible links ---
  const formatAnswer = (text) => {
    if (!text) return "";

    return text
      // Bold formatting
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      // Bible references
      .replace(/\b([1-3]?\s?[A-Za-z]+\s\d+:\d+(-\d+)?)/g, (match) => {
        const encoded = match.replace(/\s+/g, "%20");
        return `<a href="https://www.bible.com/bible/111/${encoded}.NIV" target="_blank" class="text-blue-600 underline">${match}</a>`;
      });
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setRelated([]);
    setSuggested([]);

    try {
      const res = await fetch("https://your-backend.vercel.app/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");
      setRelated(data.relatedQuestions || []);
      setSuggested(data.suggestedQuestions || []);
      setRecent((prev) => [question, ...prev.slice(0, 4)]);
    } catch (err) {
      setAnswer("⚠️ Error fetching answer. Please try again.");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    alert("Answer copied!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Bible AI Assistant
        </h1>

        {/* Input */}
        <div className="flex mb-6 shadow-sm">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l-lg p-3 focus:outline-none"
            placeholder="Ask a Bible question..."
          />
          <button
            onClick={handleAsk}
            className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Ask"}
          </button>
        </div>

        {/* Main Answer Card */}
        {answer && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div
              className="prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: formatAnswer(answer) }}
            />
            <div className="text-xs text-gray-500 mt-2">
              🕒 Last updated: {new Date().toLocaleTimeString()}
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleCopy}
                className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                📋 Copy
              </button>
              <button
                onClick={() =>
                  navigator.share?.({
                    title: "Bible AI Answer",
                    text: answer,
                  })
                }
                className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                🔗 Share
              </button>
            </div>
          </div>
        )}

        {/* Suggested + Related + Recent in grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Related */}
          {related.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2 text-gray-700">
                Related Questions
              </h2>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
                {related.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested */}
          {suggested.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2 text-gray-700">
                Suggested Questions
              </h2>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
                {suggested.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent */}
          {recent.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="font-semibold mb-2 text-gray-700">
                Recent Questions
              </h2>
              <ul className="list-disc ml-5 space-y-1 text-sm text-gray-600">
                {recent.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
