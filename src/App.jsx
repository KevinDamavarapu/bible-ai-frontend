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
      // Bold formatting for *words*
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      // Turn "John 3:16" etc. into clickable links
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Bible AI Assistant
        </h1>

        {/* Question Input */}
        <div className="flex mb-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 border rounded-l-lg p-2"
            placeholder="Ask a Bible question..."
          />
          <button
            onClick={handleAsk}
            className="bg-blue-600 text-white px-4 rounded-r-lg"
            disabled={loading}
          >
            {loading ? "Loading..." : "Ask"}
          </button>
        </div>

        {/* Answer */}
        {answer && (
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formatAnswer(answer) }}
            />
            <div className="text-sm text-gray-500 mt-2">
              🕒 Last updated: {new Date().toLocaleTimeString()}
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCopy}
                className="text-sm px-2 py-1 bg-gray-200 rounded"
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
                className="text-sm px-2 py-1 bg-gray-200 rounded"
              >
                🔗 Share
              </button>
            </div>
          </div>
        )}

        {/* Related Questions */}
        {related.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Related questions:</h2>
            <ul className="list-disc ml-5">
              {related.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Questions */}
        {suggested.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Suggested questions:</h2>
            <ul className="list-disc ml-5">
              {suggested.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Questions */}
        {recent.length > 0 && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Recent questions:</h2>
            <ul className="list-disc ml-5">
              {recent.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
