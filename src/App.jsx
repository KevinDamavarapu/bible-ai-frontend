import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// ✅ Feature 14: Persistent Last Answer using Local Storage
const getSavedData = () => {
  const saved = localStorage.getItem("bible_ai_data");
  return saved ? JSON.parse(saved) : { question: "", answer: "" };
};

export default function App() {
  // ✅ Feature 1: Bible AI Query Input
  const [question, setQuestion] = useState(getSavedData().question);
  // ✅ Feature 2: Answer Display
  const [answer, setAnswer] = useState(getSavedData().answer);
  // ✅ Feature 3: Loading State
  const [loading, setLoading] = useState(false);
  // ✅ Feature 4: Error Handling
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]); // ✅ Feature 17: Question History

  const answerRef = useRef(null);

  // ✅ Feature 6: Auto-scroll to Answer
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // ✅ Feature 14: Save to Local Storage
    localStorage.setItem(
      "bible_ai_data",
      JSON.stringify({ question, answer })
    );
  }, [answer]);

  // ✅ Feature 13: Press Enter to Ask
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      fetchAnswer();
    }
  };

  // ✅ Feature 1-4: Ask Question Function
  const fetchAnswer = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/bible", // 🔹 Change to your deployed FastAPI URL later
        null,
        { params: { query: question } }
      );
      setAnswer(res.data.answer || "No answer received.");
      setHistory((prev) => [question, ...prev.slice(0, 9)]); // ✅ Feature 17
    } catch (err) {
      setError("Failed to fetch answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Feature 8: Clear Button
  const clearAll = () => {
    setQuestion("");
    setAnswer("");
    setError("");
    localStorage.removeItem("bible_ai_data");
  };

  // ✅ Feature 7: Copy to Clipboard
  const copyAnswer = () => {
    navigator.clipboard.writeText(answer);
    alert("Answer copied to clipboard!");
  };

  // ✅ Feature 15: Voice Input
  const handleVoiceInput = () => {
    const recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognition) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const mic = new recognition();
    mic.start();
    mic.onresult = (event) => {
      setQuestion(event.results[0][0].transcript);
    };
  };

  // ✅ Sample Questions (Feature 12)
  const samples = [
    "Tell me something about Moses",
    "How many books are in the Bible?",
    "Explain the story of David and Goliath",
    "What are the fruits of the Spirit?",
  ];

  return (
    <div
      className="flex flex-col items-center min-h-screen p-4"
      style={{
        backgroundColor: "#1a1a1a", // ✅ Dark theme background
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ✅ Feature 5: Responsive Design + Feature 11: Dark & Light Theme */}
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-3xl mb-2 flex justify-center items-center">
          📖 Bible AI
        </h1>
        <p className="text-center mb-4 text-gray-300">
          Ask any Bible-related question below:
        </p>

        {/* ✅ Feature 12: Sample Questions */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {samples.map((s, i) => (
            <button
              key={i}
              className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-sm"
              onClick={() => setQuestion(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 p-2 rounded text-black"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            onClick={fetchAnswer}
            disabled={loading}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
          <button
            onClick={handleVoiceInput}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
            title="Voice Input"
          >
            🎤
          </button>
        </div>

        {/* ✅ Feature 8 & 7: Clear & Copy Buttons */}
        <div className="flex gap-2 mb-4 justify-end">
          <button
            onClick={clearAll}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-500 text-sm"
          >
            Clear
          </button>
          {answer && (
            <button
              onClick={copyAnswer}
              className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-400 text-sm"
            >
              Copy Answer
            </button>
          )}
        </div>

        {/* ✅ Feature 2 + 9: Answer with Fade-In Animation */}
        <div
          ref={answerRef}
          className="p-4 rounded bg-white text-black whitespace-pre-line transition-opacity duration-500"
          style={{ minHeight: "120px", opacity: answer ? 1 : 0.5 }}
        >
          {error && <p className="text-red-500">{error}</p>}
          {answer && (
            <>
              <strong>Answer:</strong> {answer}
            </>
          )}
        </div>

        {/* ✅ Feature 17: History of Past Questions */}
        {history.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg mb-2">Recent Questions:</h2>
            <ul className="list-disc ml-5 text-gray-400">
              {history.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}






