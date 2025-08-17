import { useState } from "react";
import toast from "react-hot-toast";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchAnswer = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    toast.loading("Thinking...", { id: "thinking" });

    try {
      const res = await fetch("https://bible-ai-wmlk.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setAnswer(data.answer || "No answer found.");
      setHistory((prev) => [query, ...prev.slice(0, 4)]); // save last 5
      toast.success("Answer ready!", { id: "thinking" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: "thinking" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1 className="title">Bible AI</h1>

      <div className="input-box">
        <input
          type="text"
          value={query}
          placeholder="Ask me anything about the Bible..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchAnswer()}
        />
        <button onClick={fetchAnswer} disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {answer && (
        <div className="answer-box">
          <p>{answer}</p>

          {/* Copy + Share buttons */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              className="suggestion-btn"
              onClick={() => {
                navigator.clipboard.writeText(answer);
                toast.success("Copied!");
              }}
            >
              Copy
            </button>

            <button
              className="suggestion-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({ text: answer })
                    .catch(() => toast.error("Share failed"));
                } else {
                  navigator.clipboard.writeText(answer);
                  toast.success("Copied (no share available)");
                }
              }}
            >
              Share
            </button>
          </div>
        </div>
      )}

      {/* Recent Questions history */}
      {history.length > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "left",
            width: "90%",
            maxWidth: "600px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem" }}>Recent Questions</h3>
          <ul>
            {history.map((q, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>
                • {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
