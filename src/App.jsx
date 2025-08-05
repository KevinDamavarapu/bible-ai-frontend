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
        "https://bible-ai-wmlk.onrender.com/bible",
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
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", marginTop: "50px" }}>
      <h1>📖 Bible AI</h1>
      <p>Ask any Bible-related question below:</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your question..."
        style={{
          width: "60%",
          padding: "10px",
          fontSize: "16px",
          marginRight: "10px",
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
        }}
      >
        Ask
      </button>

      {loading && <p style={{ marginTop: "20px" }}>⏳ Fetching answer...</p>}

      {answer && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            width: "60%",
            marginLeft: "auto",
            marginRight: "auto",
            background: "#f9f9f9",
            textAlign: "left",
          }}
        >
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;




