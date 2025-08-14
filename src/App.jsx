import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    setLoading(true);
    setAnswer("");

    // Show toast when backend might be waking up
    toast.loading("Backend might be waking up... Please wait.", {
      id: "backend-wakeup",
    });

    try {
      const res = await fetch("https://bible-ai-backend.onrender.com/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch answer.");
      }

      const data = await res.json();
      setAnswer(data.answer || "No answer found.");

      // Remove wakeup toast and show success
      toast.dismiss("backend-wakeup");
      toast.success("Answer received!");
    } catch (error) {
      console.error(error);
      toast.dismiss("backend-wakeup");
      toast.error("Error fetching answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 text-center">
      <Toaster position="top-center" />

      <h1 className="text-4xl font-bold mb-6 text-gray-800">Bible AI</h1>

      <div className="w-full max-w-xl">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg shadow text-white transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Loading..." : "Ask"}
        </button>
      </div>

      {loading && (
        <p className="mt-4 text-gray-600 animate-pulse">
          Please wait, backend might be waking up...
        </p>
      )}

      {answer && (
        <div className="mt-6 w-full max-w-xl bg-white border border-gray-200 rounded-lg p-4 shadow overflow-y-auto max-h-64">
          {answer}
        </div>
      )}
    </div>
  );
}

export default App;
