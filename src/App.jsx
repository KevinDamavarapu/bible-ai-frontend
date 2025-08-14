import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Your suggested questions
  const suggestions = [
    "What does the Bible say about forgiveness?",
    "Explain the parable of the prodigal son.",
    "What is faith according to the Bible?",
  ];

  // Main ask handler
  const handleAsk = async (q) => {
    const finalQuestion = q || question;

    if (!finalQuestion.trim()) {
      toast.error("Please enter a question before asking.");
      return;
    }

    setIsLoading(true);
    setAnswer("");

    try {
      // Call your backend API
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: finalQuestion }),
      });

      if (!res.ok) throw new Error("Failed to get response from server.");

      const data = await res.json();
      setAnswer(data.answer || "No answer received.");
      toast.success("Answer received!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for suggested questions
  const handleSuggestionClick = (q) => {
    setQuestion(q);
    handleAsk(q);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <Toaster position="top-right" />

      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Bible AI
      </h1>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(s)}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm shadow transition"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input & Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        />
        <button
          onClick={() => handleAsk()}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* Answer box */}
      <div className="mt-8 w-full max-w-2xl">
        {answer && (
          <div className="p-6 bg-white rounded-lg shadow text-gray-800 whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
