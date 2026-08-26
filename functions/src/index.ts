import { onCall, HttpsError } from "firebase-functions/v2/https";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `You are a knowledgeable research assistant for the ZFHX4 Research Hub. You help people understand scientific findings about loss of function in the ZFHX4 gene.

Key research papers in the database:

1. "Loss of function of the zinc finger homeobox 4 gene, ZFHX4, underlies a neurodevelopmental disorder" (Baca et al., 2025, American Journal of Human Genetics)
   - Study of 57 people with ZFHX4 protein-truncating variants or deletions
   - Describes shared developmental features and provides evidence that ZFHX4 loss of function is the underlying mechanism

2. "Loss-of-function of the Zinc Finger Homeobox 4 (ZFHX4) gene underlies a neurodevelopmental disorder" (Del Rocío et al., 2024, medRxiv preprint)
   - Preprint reporting 57 individuals (52 probands, 5 affected family members)
   - Early access version of the peer-reviewed study above

3. "Role of ZFHX4 in orofacial clefting based on human genetic data and zebrafish models" (Ishorst et al., 2025, European Journal of Human Genetics)
   - Combines human genetic data with zebrafish experiments
   - Explores ZFHX4's role in cleft lip and palate and craniofacial development

4. "A ZFHX4 mutation associated with a recognizable neuropsychological and facial phenotype" (Fontana et al., 2021, American Journal of Medical Genetics Part A)
   - Describes a person with a ZFHX4 variant and recognizable neuropsychological and facial features

Guidelines:
- Provide accurate, helpful information based on these studies
- Be clear about what is established evidence vs. preliminary findings
- Always recommend discussing findings with healthcare providers
- Keep responses concise but informative (2-4 paragraphs max)
- Use plain language accessible to non-specialists
- Do not provide medical advice or diagnoses`;

const SYNTHESIS_PROMPT = `Based on the research papers about ZFHX4 loss of function, provide a clear, concise synthesis of the key findings as 3-4 bullet points. Each bullet should be 1-2 sentences highlighting the most important discoveries and their implications. Start each bullet with "•" and do not use markdown headers.`;

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  temperature = 0.5,
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new HttpsError(
      "failed-precondition",
      "Groq API key is not configured. Please set GROQ_API_KEY in your environment.",
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature,
        max_tokens: 1024,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", response.status, errorText);
    throw new HttpsError("internal", `Groq API returned an error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new HttpsError("internal", "No response generated.");
  }

  return content;
}

export const chatAboutResearch = onCall(
  {
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (request) => {
    const { message, history } = request.data as {
      message: string;
      history?: Array<{ role: string; content: string }>;
    };

    if (!message) {
      throw new HttpsError("invalid-argument", "Message is required.");
    }

    const chatMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (history && history.length > 0) {
      for (const msg of history.slice(-6)) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }

    chatMessages.push({ role: "user", content: message });

    try {
      const answer = await callGroq(chatMessages, 0.5);
      return { answer };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("Error in chatAboutResearch:", error);
      throw new HttpsError("internal", "Failed to generate a response. Please try again.");
    }
  },
);

export const synthesizeFindings = onCall(
  {
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async () => {
    try {
      const content = await callGroq(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: SYNTHESIS_PROMPT },
        ],
        0.3,
      );
      return { content };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("Error in synthesizeFindings:", error);
      throw new HttpsError("internal", "Failed to generate synthesis. Please try again.");
    }
  },
);
