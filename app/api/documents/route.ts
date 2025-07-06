import { connectDB } from "@/app/lib/db";
import Document from "@/app/models/Document";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { title, content, summary } = await req.json();
    const doc = await Document.create({ title, content, summary });
    return new Response(JSON.stringify(doc), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to save document" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    await connectDB();
    const docs = await Document.find().sort({ createdAt: -1 });
    return new Response(JSON.stringify(docs), { status: 200 });
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch documents" }),
      { status: 500 }
    );
  }
}
