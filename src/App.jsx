import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await axios.post(
        "https://bible-ai-wmlk.onrender.com/bible",
        { query },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setAnswer(response.data.answer || "No answer received.");
    } catch (err) {
      setError("Failed to fetch answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial" }}>
      <h1>Bible AI</h1>
      <input
        type="text"
        placeholder="Ask something about the Bible..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", padding: "10px", fontSize: "16px" }}
      />
      <button
        onClick={handleAsk}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Asking..." : "Ask"}
      </button>

      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      {answer && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "5px" }}>
          <strong>Answer:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}


