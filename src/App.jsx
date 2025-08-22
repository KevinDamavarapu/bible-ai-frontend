import React, { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Regex to match Bible references like "Ephesians 4:32" or "Matthew 18:21-35"
  const bibleRefRegex = /\b([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)(?:-(\d+))?\b/g;

  // Function to format answers and add clickable Bible.com links (NIV)
  const formatAnswerWithLinks = (text) => {
    return text.split("\n").map((line, idx) => {
      const formattedLine = line.replace(bibleRefRegex, (match, book, chapter, verse, endVerse) => {
        const ref = `${book} ${chapter}:${verse}${endVerse ? "-" + endVerse : ""}`;
        const urlBook = book.replace(/\s/g, "").toLowerCase(); // bible.com uses lowercase with no spaces
        const url = `https://www.bible.com/bible/111/${urlBook}.${chapter}.${verse}.NIV`;
        return `<a href="${url}" target="_blank" class="text-blue-600 underline">${ref}</a>`;
      });

      return (
        <p
          key={idx}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
          className="mb-2"
        />
      );
    });
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer("");
    setRelatedQuestions([]);

    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnswer(data.answer || "No answer found.");
      setRelatedQuestions(data.related_questions || []);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Bible AI Companion
      </h1>

      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the Bible..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-200"
          rows={3}
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {answer && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Answer:
            </h2>
            <div className="prose prose-blue">
              {formatAnswerWithLinks(answer)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              🕒 Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}

        {relatedQuestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Related questions:
            </h3>
            <ul className="list-disc pl-5 text-gray-700">
              {relatedQuestions.map((q, i) => (
                <li key={i} className="mb-1">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
