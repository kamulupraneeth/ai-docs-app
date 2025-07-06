import { OpenAI } from "openai";

// Create OpenAI Client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
  },
});

// Post handler for /api/summarize
export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "No Content Provided" }), {
        status: 400,
      });
    }

    const prompt = `Summarize the following document in 4-6 bullet points, making it easy to read and clear for users.

Title: ${title}

Content:
${content}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText = chatCompletion.choices[0].message.content;
    // const fakeResponse = "This is a sample summary from AI.";

    return new Response(JSON.stringify({ result: responseText }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Error from OpenAI:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      {
        status: 500,
      }
    );
  }
}
