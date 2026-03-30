import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Slide {
  title: string;
  subtitle?: string;
  content: string[];
  speakerNotes?: string;
  imageKeyword?: string;
  layout?: "title" | "section" | "content-split" | "content-full" | "quote" | "grid" | "chart";
  themeColor?: "blue" | "emerald" | "violet" | "rose" | "amber" | "slate";
  chartData?: { name: string; value: number }[];
  chartType?: "bar" | "line" | "pie" | "area";
}

export interface AIResponse {
  message: string;
  slides: Slide[];
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    message: {
      type: Type.STRING,
      description: "A conversational response explaining the changes made or acknowledging the user's request.",
    },
    slides: {
      type: Type.ARRAY,
      description: "The complete list of slides for the presentation.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the slide." },
          subtitle: { type: Type.STRING, description: "A short, impactful subtitle or key takeaway for the slide." },
          content: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Detailed bullet points. Each point MUST be a complete, professional sentence (15-30 words) providing deep insights, not just short phrases.",
          },
          speakerNotes: {
            type: Type.STRING,
            description: "Optional notes for the speaker.",
          },
          imageKeyword: {
            type: Type.STRING,
            description: "A highly relevant, professional keyword for fetching a background image (e.g., 'corporate office', 'data analytics', 'business meeting'). DO NOT use random animals unless specifically requested.",
          },
          layout: {
            type: Type.STRING,
            description: "The layout type for this slide. Choose from: 'title' (for the very first slide), 'section' (for transitioning to a new topic), 'content-split' (text on one side, image on the other), 'content-full' (just text, no image), 'quote' (for emphasizing a key point), 'grid' (for comparing multiple items or showing a matrix of points), 'chart' (for data visualization).",
            enum: ["title", "section", "content-split", "content-full", "quote", "grid", "chart"]
          },
          themeColor: {
            type: Type.STRING,
            description: "The primary color theme for this slide. Choose to match the mood.",
            enum: ["blue", "emerald", "violet", "rose", "amber", "slate"]
          },
          chartData: {
            type: Type.ARRAY,
            description: "Data for the chart. Required if layout is 'chart'.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Label for the data point (e.g., 'Q1', '2023', 'Revenue')" },
                value: { type: Type.NUMBER, description: "Numeric value for the data point" }
              },
              required: ["name", "value"]
            }
          },
          chartType: {
            type: Type.STRING,
            description: "Type of chart to render. Required if layout is 'chart'.",
            enum: ["bar", "line", "pie", "area"]
          }
        },
        required: ["title", "content", "imageKeyword", "layout", "themeColor"],
      },
    },
  },
  required: ["message", "slides"],
};

export async function generatePresentation(
  documentText: string,
  userPrompt?: string,
  currentSlides?: Slide[]
): Promise<AIResponse> {
  let prompt = `You are an expert, top-tier management consulting presentation designer (like McKinsey or BCG). Your task is to create a highly professional, EXTREMELY DETAILED, and structured slide presentation based on the provided document text and user instructions.

Key requirements for the presentation:
1. **Structure**: It MUST have a clear narrative arc:
   - A compelling Title Slide (layout: 'title').
   - An Agenda/Executive Summary slide (layout: 'content-full' or 'content-split').
   - Clearly divided sections with Section Header slides (layout: 'section').
   - Detailed content slides with actionable insights.
   - A strong Conclusion/Next Steps slide.
   - Generate between 8 to 15 slides to ensure comprehensive coverage.
2. **Content Depth**: Extract the most important data points, strategies, and details. DO NOT use short, vague bullet points. Every bullet point MUST be a detailed, professional sentence (1-2 sentences per point) that provides real value and context. Include a 'subtitle' for every slide that summarizes the main takeaway.
3. **Visuals**: For 'imageKeyword', choose highly relevant, professional corporate/business/technology keywords (e.g., 'corporate office', 'data analytics', 'business meeting', 'server room'). DO NOT use random animals or unrelated nature images unless specifically requested.
4. **Layouts**: Vary the slide layouts to keep the audience engaged. Use 'title' for the start, 'section' for new topics, 'content-split' for visual points, 'content-full' for data-heavy points, 'quote' for key takeaways, 'grid' for lists of 4+ items, and 'chart' for visualizing data, trends, or comparisons. If using 'chart', you MUST provide 'chartData' (array of {name, value}) and 'chartType' ('bar', 'line', 'pie', or 'area').
5. **Theme**: Choose a consistent 'themeColor' for the presentation, or vary it slightly for different sections.`;

  if (documentText) {
    prompt += `\n\n--- DOCUMENT TEXT ---\n${documentText}\n---------------------\n`;
  }

  if (currentSlides && currentSlides.length > 0) {
    prompt += `\n\n--- CURRENT SLIDES ---\n${JSON.stringify(currentSlides, null, 2)}\n----------------------\n`;
  }

  if (userPrompt) {
    prompt += `\n\n--- USER INSTRUCTION ---\n${userPrompt}\n------------------------\n`;
  } else {
    prompt += `\n\nPlease generate an initial presentation outline with 5-10 slides based on the document text.`;
  }

  prompt += `\n\nRespond with a JSON object containing a conversational 'message' and the complete updated array of 'slides'.`;

  const maxRetries = 3;
  const baseDelay = 2000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const parsed = JSON.parse(text) as AIResponse;
      return parsed;
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || error?.status === 429;
      
      if (isRateLimit && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Rate limit hit (429). Retrying in ${delay}ms (Attempt ${attempt} of ${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("Error generating presentation:", error);
      if (isRateLimit) {
        throw new Error("API rate limit exceeded. Please wait a moment and try again.");
      }
      throw error;
    }
  }
  
  throw new Error("Failed to generate presentation after multiple attempts.");
}
