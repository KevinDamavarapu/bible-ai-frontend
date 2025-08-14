import { useState } from "react";
import toast from "react-hot-toast";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  async function fetchAnswer() {
    try {
      const loadingToast = toast.loading("Backend is waking up... please wait");

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (res.ok) {
        setAnswer(data.answer || "No answer received");
      } else {
        toast.error(data.error || "Something went wrong! Try again.");
      }
    } catch (error) {
      toast.error("Unable to reach backend. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Bible AI
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Ask your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchAnswer}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ask
          </button>
        </div>

        {answer && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-700">Answer:</h2>
            <p className="text-gray-800 mt-1">{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
