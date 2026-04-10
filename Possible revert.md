# GENERATE QUESTION EDGE LOVABLE AI API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

const SUPPORTED_TYPES = ["mcq", "true_false", "fill_blank", "short_answer", "essay"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, imageDataUrl, questionTypes, difficulty, count, courseCode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const normalizedTypes = Array.isArray(questionTypes)
      ? questionTypes.filter((t: string) => SUPPORTED_TYPES.includes(t))
      : [];

    if ((!content || !String(content).trim()) && !imageDataUrl) {
      return new Response(
        JSON.stringify({ error: "Provide pasted text content or an image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (normalizedTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Select at least one valid question type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const totalCount = Math.max(1, Math.min(50, Number(count) || 10));
    const typesList = normalizedTypes.join(", ");

    const systemPrompt = `You are an expert exam question generator for a polytechnic CBT system.\nGenerate exactly ${totalCount} questions.\n\nSTRICT RULES:\n- Allowed question types ONLY: ${typesList}\n- Never output any other type\n- Difficulty level: ${difficulty || "mixed"}\n- Course: ${courseCode || "General"}\n- For MCQ: exactly 4 options and one correct answer\n- For true_false: correct answer must be "True" or "False"\n- For fill_blank / short_answer / essay: provide expected answer\n- Distribute types as evenly as possible\n- Questions must be academically rigorous and unambiguous`;

    const userContent: any = imageDataUrl
      ? [
          { type: "text", text: `Generate ${totalCount} questions from this material. Also use any provided text:\n\n${String(content || "").slice(0, 12000)}` },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ]
      : `Generate ${totalCount} questions from this content:\n\n${String(content).slice(0, 15000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: `Generate exactly ${totalCount} exam questions from course content`,
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: normalizedTypes },
                        text: { type: "string" },
                        options: { type: "array", items: { type: "string" } },
                        correctAnswer: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                      },
                      required: ["type", "text", "correctAnswer", "difficulty"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return structured output");

    let questions: any[] = [];
    try {
      const parsed = JSON.parse(toolCall.function.arguments);
      questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch {
      throw new Error("Failed to parse AI response");
    }

    const sanitized = questions
      .filter((q) => q && normalizedTypes.includes(q.type))
      .slice(0, totalCount)
      .map((q) => ({
        type: q.type,
        text: String(q.text || "").trim(),
        options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : undefined,
        correctAnswer: String(q.correctAnswer || "").trim(),
        difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      }))
      .filter((q) => q.text.length > 0 && q.correctAnswer.length > 0);

    return new Response(
      JSON.stringify({ questions: sanitized, filteredOutCount: Math.max(0, questions.length - sanitized.length) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

# End of Generate Question Edge Lovable AI cloud

# AI Generate Questions Saved (Individual saved, I updated it to bulk saved at once to improve speed using promise.all related file AdminPages AIQuestionGeneratorPage)

 setSaving(true);
    let saved = 0;
    let failed = 0;

    for (const q of selected) {
      try {
        await api.createQuestion({
          type: q.type,
          text: q.text,
          options: q.type === "mcq" ? q.options : undefined,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          courseId,
        });
        saved++;
      } catch {
        failed++;
      }
    }

    setSaving(false);

    if (saved > 0) toast.success(`Saved ${saved} questions to the bank!`);
    if (failed > 0) toast.error(`${failed} questions failed to save`);

# End of the AI Generate Change