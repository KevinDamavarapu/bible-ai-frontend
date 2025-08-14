import React, { useState } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setAnswer("Error fetching answer.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Bible AI</h1>
      <div className="flex mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l bg-gray-800 border border-gray-700 text-white focus:outline-none"
        />
        <button
          onClick={handleAsk}
          className="px-4 py-2 bg-black hover:bg-gray-700 rounded-r"
        >
          Ask
        </button>
      </div>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        answer && (
          <div className="bg-gray-800 p-4 rounded max-w-md text-center">
            {answer}
          </div>
        )
      )}
    </div>
  );
}

export default App;
