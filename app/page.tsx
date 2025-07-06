import Editor from "./components/Editor";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto mt-10 px-4 pb-10">
      <h1 className="text-2xl font-bold mb-4">AI Docs Editor</h1>
      <Editor />
    </main>
  );
}
