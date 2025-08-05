import { useState } from "react";
import axios from "axios";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post(
        "https://bible-ai-wmlk.onrender.com/bible", // Your backend endpoint
        null,
        { params: { query } }
      );
      setAnswer(response.data.answer || "No answer received.");
    } catch (error) {
      console.error(error);
      setAnswer("Error: Could not fetch the answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        marginTop: "50px",
        backgroundColor: "#1a1a1a",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1>📖 Bible AI</h1>
      <p>Ask any Bible-related question below:</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your question..."
          style={{
            flex: "1",
            minWidth: "250px",
            maxWidth: "500px",
            padding: "10px",
            fontSize: "16px",
          }}
        />
        <button
          onClick={handleAsk}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Ask
        </button>
      </div>

      {loading && <p style={{ marginTop: "20px" }}>⏳ Fetching answer...</p>}

      {answer && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto",
            background: "#f9f9f9",
            color: "#000", // ✅ Make text black for visibility
            textAlign: "left",
            lineHeight: "1.5",
          }}
        >
          <h3 style={{ color: "#333" }}>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;





