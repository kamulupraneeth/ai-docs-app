"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your document..." }),
    ],
    content: "",
  });

  const [title, setTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const summaryRef = useRef<HTMLDivElement>(null);

  const handleSummarize = async () => {
    if (!editor) return;

    const content = editor.getText().trim();
    if (!title.trim() || !content) {
      alert("Please enter both a title and some content");
      return;
    }

    if (summaryRef.current) {
      summaryRef.current.scrollTop = 0;
    }

    setSummary("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        setLoading(false);
        setError("Please check your connection");
        return;
      }

      const data = await res.json();

      setSummary(data.result || "Failed to summarize");

      // Save document to MONGODB
      const result = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, summary: data?.result }),
      });

      if (!result.ok) {
        const error = await result.json();
        console.error("Save error:", error);
        alert("Failed to save document.Please try again.");
        setLoading(false);
        return;
      }

      const savedData = await result.json();

      if (savedData) {
        setTitle("");
        editor.commands.clearContent();
      }

      setLoading(false);
    } catch {
      setError("Network error: failed to fetch. Please check your connection");
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (summaryRef.current) {
        summaryRef.current.scrollTop = 0;
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [summary]);

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <input
        type="text"
        placeholder="Enter title"
        className="w-full border-2 border-black mb-4 p-3 rounded placeholder-gray-500 caret-black text-black"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <EditorContent
        editor={editor}
        className="border-2 border-black rounded p-0 caret-black text-black"
      />
      <button
        onClick={handleSummarize}
        className="bg-blue-600 text-white rounded hover:bg-blue-700 py-2 px-4 mt-4"
      >
        {loading ? "Summarizing" : "Summarize with AI"}
      </button>

      {error && (
        <p className="text-red-600 mt-6 border max-w-sm mx-auto text-center p-4 rounded-sm bg-red-100">
          {error}
        </p>
      )}

      <div className="relative">
        {loading && (
          <span className="animate-spin w-5 h-5 bg-blue-600 border-2 inline-block border-white border-t-transparent rounded-full absolute top-8 left-2"></span>
        )}

        {summary && (
          <div
            className={`mt-4 p-3 border rounded bg-gray-50 ${
              loading ? "pl-10 transition-all" : ""
            }`}
          >
            <h2 className="font-semibold mb-1 text-black">AI Summary:</h2>

            <div
              ref={summaryRef}
              className="whitespace-pre-line text-black overflow-y-auto max-h-64"
              dangerouslySetInnerHTML={{ __html: summary }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
