import { DEFAULT_API_KEY } from "./config.js";
import { getStoredApiKey } from "./storage.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateStory({ childName, ageGroup, theme, world, moralLesson }) {
  const apiKey = getStoredApiKey() || DEFAULT_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("No Gemini API key found. Please open Settings to enter your API key.");
  }

  const systemInstruction = `You are WonderTales, an award-winning children's author and kindergarten teacher.
You write engaging, heartwarming, imaginative, and strictly age-appropriate stories for children.
SAFETY RULES:
- Never include violence, danger, scary monsters, mature content, cruelty, or horror.
- Tone must always be warm, uplifting, educational, and fun.
- Vocabulary and sentence length MUST be tailored to the child's age group:
  * 3-5: Simple words, repetitive playful sounds, short sentences, big sensory descriptions.
  * 6-8: Exciting chapter-like story, fun dialogues, relatable dilemmas, gentle humor.
  * 9-12: Rich storytelling, descriptive vocabulary, character growth, critical thinking questions.

You MUST respond ONLY with a raw, valid JSON object (no markdown fences, no triple backticks) matching this exact schema:
{
  "title": "A fun, magical title",
  "soundEffect": "A playful onomatopoeia sound to start",
  "paragraphs": ["First paragraph...", "Second paragraph...", "Third paragraph...", "Fourth paragraph..."],
  "moral": "One clear, positive moral takeaway sentence.",
  "funVocabulary": [{"word": "Magnificent", "meaning": "Extremely beautiful or wonderful."}],
  "discussionQuestions": ["What would you have done if you were in the story?"]
}`;

  const userPrompt = `Write a magical story for:
- Child's Name: ${childName}
- Age Group: ${ageGroup}
- Theme: ${theme}
- World / Setting: ${world}
- Moral Lesson: ${moralLesson}`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey.trim()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.8, topP: 0.95, responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `API error (${response.status})`;
    if (response.status === 403 || message.includes("API key")) {
      throw new Error("Invalid or restricted API key. Please check Settings.");
    }
    if (response.status === 429) {
      throw new Error("AI is catching its breath! Please wait 30 seconds and try again.");
    }
    throw new Error(message);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("The AI returned an empty response. Please try again!");

  try {
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return {
      title: `${childName}'s Adventure in ${world}`,
      soundEffect: "✨ Ding! Sparkle!",
      paragraphs: rawText.split("\n\n").filter(p => p.trim().length > 0),
      moral: `Always remember to practice ${moralLesson.toLowerCase()}.`,
      funVocabulary: [],
      discussionQuestions: ["What was your favorite part of this adventure?"]
    };
  }
}
