import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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
    "Explain the Ten Commandments"
  ];

  const handleAsk = async () => {
    if (!question.trim()) return;
    try {
      const response = await axios.post("http://localhost:5000/api/ask", {
        question,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry, something went wrong. Please try again.");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
  };

  return (
    <div className="app">
      <h1>📖 Bible AI</h1>
      <p>Ask anything about the Bible</p>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
        />
        <button onClick={handleAsk}>Ask</button>
      </div>

      <h2>Try one of these:</h2>
      <div className="suggestions">
        {suggestions.map((s, index) => (
          <button key={index} onClick={() => handleSuggestionClick(s)}>
            {s}
          </button>
        ))}
      </div>

      {answer && (
        <div className="answer">
          <h3>Answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
