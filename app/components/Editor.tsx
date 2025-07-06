"use client";

import React, { useState } from "react";
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

  const handleSummarize = async () => {
    if (!editor) return;

    const content = editor.getText().trim();
    if (!title.trim() || !content) {
      alert("Please enter both a title and some content");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || "Summarization failed");
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
      alert("Document saved successfully!");
    }

    setLoading(false);
  };

  return (
    <>
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
        {summary && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h2 className="font-semibold mb-1 text-black">AI Summary:</h2>
            <p
              className="whitespace-pre-line text-black"
              dangerouslySetInnerHTML={{ __html: summary }}
            ></p>
          </div>
        )}
      </div>
    </>
  );
}
