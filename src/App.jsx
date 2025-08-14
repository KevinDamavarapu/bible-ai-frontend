import { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What does the Bible say about forgiveness?",
    "Tell me a verse about hope",
    "What is the meaning of John 3:16?",
    "Give me a Bible story about kindness",
    "What does Proverbs say about wisdom?",
  ];

  const askQuestion = async (q) => {
    const finalQuestion = q || question;
    if (!finalQuestion.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("https://bible-ai-wmlk.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: finalQuestion }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");
    } catch (error) {
      console.error("Error fetching answer:", error);
      setAnswer("Error: Could not retrieve answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Bible AI
      </h1>

      {/* Suggested Questions */}
      <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-3xl">
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => askQuestion(sq)}
            className="bg-white shadow-md rounded-full px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex flex-col items-center w-full max-w-2xl space-y-4">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => askQuestion()}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          Ask
        </button>
      </div>

      {/* Answer Box */}
      {loading && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md max-w-2xl w-full text-center">
          Thinking…
        </div>
      )}

      {!loading && answer && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md max-w-2xl w-full text-gray-800 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}
