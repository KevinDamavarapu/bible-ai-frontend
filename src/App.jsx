import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Share2 } from "lucide-react";

// Regex to detect Bible references like "John 3:16"
const referenceRegex = /\b([1-3]?\s?[A-Za-z]+)\s(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?\b/g;

// Function to wrap references with clickable Bible.com NIV links
function highlightReferences(text) {
  return text.split("\n").map((line, idx) => {
    const parts = [];
    let lastIndex = 0;

    line.replace(referenceRegex, (match, book, chapter, verse, endVerse, offset) => {
      if (offset > lastIndex) {
        parts.push(line.substring(lastIndex, offset));
      }
      const ref = `${book} ${chapter}:${verse}${endVerse ? "-" + endVerse : ""}`;
      const url = `https://www.bible.com/bible/111/${book.replace(/\s+/g, "").toUpperCase()}.${chapter}.${verse}.NIV`;
      parts.push(
        <a
          key={offset}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          {ref}
        </a>
      );
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return <p key={idx}>{parts}</p>;
  });
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setAnswer("⏳ Fetching answer...");
    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      setAnswer(data.answer || "No answer found.");
      setRelatedQuestions(data.related_questions || []);
      setRecentQuestions((prev) => [question, ...prev.slice(0, 4)]);
    } catch (err) {
      setAnswer("⚠️ Error fetching answer.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white p-6">
      <motion.div
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          📖 Bible AI (NIV)
        </h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a Bible question..."
            className="flex-grow border rounded-lg px-4 py-2"
          />
          <Button onClick={handleAsk}>Ask</Button>
        </div>

        {answer && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Answer:</h2>
              <div className="prose">{highlightReferences(answer)}</div>
              <div className="flex gap-4 mt-2 text-gray-500">
                <button onClick={() => navigator.clipboard.writeText(answer)}>
                  <Copy size={16} className="inline mr-1" /> Copy
                </button>
                <button
                  onClick={() =>
                    navigator.share
                      ? navigator.share({ text: answer })
                      : alert("Sharing not supported")
                  }
                >
                  <Share2 size={16} className="inline mr-1" /> Share
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {relatedQuestions.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-2 text-purple-600">
              Related Questions:
            </h3>
            <ul className="list-disc pl-6">
              {relatedQuestions.map((q, i) => (
                <li key={i} className="text-gray-700">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentQuestions.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-2 text-purple-600">
              Recent Questions:
            </h3>
            <ul className="list-disc pl-6">
              {recentQuestions.map((q, i) => (
                <li key={i} className="text-gray-700">
                  {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
