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

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("https://bible-ai-backend.vercel.app/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");
    } catch (error) {
      setAnswer("Error: Could not retrieve answer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
    setTimeout(() => {
      document.querySelector("form").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    }, 0);
  };

  return (
    <div className="app-container">
      <div className="content">
        <h1>📖 Bible AI</h1>
        <p>Ask anything about the Bible</p>

        <form onSubmit={handleAsk} className="ask-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
          />
          <button type="submit">Ask</button>
        </form>

        <div className="suggestions">
          <p>Try one of these:</p>
          <div className="suggestion-buttons">
            {suggestions.map((s, idx) => (
              <button key={idx} onClick={() => handleSuggestionClick(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="thinking">Thinking...</p>}
        {answer && !loading && <div className="answer-box">{answer}</div>}
      </div>
    </div>
  );
}

export default App;
