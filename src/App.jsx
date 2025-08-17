import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchAnswer = async (userQuery) => {
    if (!userQuery.trim()) {
      toast.error("Please enter a question!");
      return;
    }

    setLoading(true);
    setAnswer("");
    toast.dismiss();
    toast.loading("Thinking...");

    try {
      // Fake API call simulation (replace with your API)
      const res = await new Promise((resolve) =>
        setTimeout(() => resolve({ text: "Sample answer for: " + userQuery }), 1500)
      );

      setAnswer(res.text);

      // Update query history (max 5)
      setHistory((prev) => {
        const updated = [userQuery, ...prev.filter((q) => q !== userQuery)];
        return updated.slice(0, 5);
      });

      toast.dismiss();
      toast.success("Answer ready!", { position: "top-center" });
    } catch (err) {
      toast.dismiss();
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    toast.success("Copied to clipboard!", { position: "top-center" });
  };

  const handleShare = async () => {
    if (!answer) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Bible AI Answer", text: answer });
      } else {
        navigator.clipboard.writeText(answer);
        toast.success("Answer copied for sharing!", { position: "top-center" });
      }
    } catch (err) {
      toast.error("Share failed!");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">Bible AI</h1>
      <p className="subtitle">Ask anything, get wisdom instantly</p>

      <div className="input-section">
        <input
          className="query-input"
          type="text"
          placeholder="Ask your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          className="ask-button"
          onClick={() => fetchAnswer(query)}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="suggestions">
          <p>Recent questions:</p>
          <div className="suggestion-buttons">
            {history.map((item, idx) => (
              <button
                key={idx}
                className="suggestion-btn"
                onClick={() => {
                  setQuery(item);
                  fetchAnswer(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Answer Box */}
      {answer && (
        <div className="answer-box fade-in">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Answer:</strong>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCopy} className="suggestion-btn">
                📋 Copy
              </button>
              <button onClick={handleShare} className="suggestion-btn">
                🔗 Share
              </button>
            </div>
          </div>
          <p>{answer}</p>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
