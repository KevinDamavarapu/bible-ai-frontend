import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = [
    "What does the Bible say about forgiveness?",
    "Explain the story of David and Goliath.",
    "What are the Ten Commandments?",
    "Who was Paul in the New Testament?"
  ];

  const askBible = async (q) => {
    if (!q.trim()) {
      toast.error("Please enter a question.");
      return;
    }

    setQuestion(q);
    setAnswer("");
    setLoading(true);
    toast.loading("Thinking...", { id: "thinking" }); // single toast with unique id

    try {
      const res = await fetch(
        `https://bible-ai-wmlk.onrender.com/bible?query=${encodeURIComponent(q)}`,
        { method: "POST" }
      );

      const data = await res.json();
      toast.dismiss("thinking");

      if (data.answer) {
        setAnswer(data.answer);
        toast.success("Got the answer!");
      } else {
        toast.error("Error: Could not retrieve answer");
      }
    } catch (error) {
      toast.dismiss("thinking");
      toast.error("Error: Could not retrieve answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <Toaster position="top-center" />
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Bible AI</h1>
        <p className="text-gray-600 mb-6">
          Ask any question about the Bible and get answers with scripture references.
        </p>

        <div className="mb-4 flex">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="flex-grow p-2 border rounded-l-lg focus:outline-none"
          />
          <button
            onClick={() => askBible(question)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg disabled:opacity-50"
          >
            Ask
          </button>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => askBible(s)}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-sm"
            >
              {s}
            </button>
          ))}
        </div>

        {answer && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left whitespace-pre-wrap">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
