import React, { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What does the Bible say about love?",
    "Who was Paul in the Bible?",
    "Explain the story of David and Goliath",
    "What is the meaning of the Parable of the Sower?",
  ];

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(
        `https://bible-ai-wmlk.onrender.com/api/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: query }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer found.");
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Error: Could not retrieve answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Bible AI</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl text-center">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => handleAsk()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mb-4"
        >
          Ask
        </button>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {suggestedQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => handleAsk(q)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="text-left whitespace-pre-wrap">
          {loading ? (
            <p className="text-blue-500">Thinking...</p>
          ) : (
            answer && <p className="text-gray-700">{answer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
