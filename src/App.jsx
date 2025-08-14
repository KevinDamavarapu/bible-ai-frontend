import React, { useState } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "What are the fruits of the Spirit?",
    "Tell me about love in Song of Solomon",
    "Who was Moses?",
    "Explain the parable of the prodigal son",
    "What does the Bible say about forgiveness?",
    "Summarize the story of David and Goliath",
    "What is the Great Commission?",
    "Who were the 12 disciples?",
    "What is the meaning of faith in Hebrews 11?",
    "Explain the Ten Commandments",
  ];

  const askQuestion = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const response = await fetch("https://bible-ai-backend.vercel.app/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await response.json();
      setAnswer(data.answer || "No answer found.");
    } catch (error) {
      setAnswer("Error: Unable to get an answer.");
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1f4037, #99f2c8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖 Bible AI</h1>
      <p>Ask anything about the Bible</p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question here..."
          style={{
            padding: "0.5rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "300px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            border: "none",
            background: "#000",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Ask
        </button>
      </form>

      <h3>Try one of these:</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          justifyContent: "center",
          maxWidth: "800px",
        }}
      >
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => askQuestion(s)}
            style={{
              background: "#000",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p style={{ marginTop: "1rem" }}>Loading...</p>}
      {answer && (
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "5px",
            marginTop: "1rem",
            maxWidth: "800px",
            textAlign: "justify",
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

export default App;
