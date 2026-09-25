import { DEFAULT_API_KEY } from "./config.js";
import { getStoredApiKey } from "./storage.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function getFallbackStory({ childName, ageGroup, theme, world, moralLesson }) {
  const soundEffects = {
    "Whispering Enchanted Forest": "🍃 Rustle-whoosh! Sparkle!",
    "Cosmic Starlight Galaxy": "🚀 Zoom-ping! Twinkle!",
    "Deep Coral Ocean Kingdom": "🐠 Splish-splash! Bubble-pop!",
    "Fluffy Cloud City": "☁️ Whoooosh! Soft-puff!",
    "Cozy Backyard Jungle": "🐾 Pitter-patter! Chirp!"
  };

  const soundEffect = soundEffects[world] || "✨ Ding! Sparkle!";

  return {
    title: `${childName}'s Adventure in the ${world}`,
    soundEffect: soundEffect,
    paragraphs: [
      `Once upon a time, young ${childName} woke up to a gentle breeze carrying a whisper of excitement. Today was no ordinary day in the ${world}—it was the day of the Great Celebration!`,
      `Venturing forth, ${childName} encountered a gentle friend who seemed lost along the path. Remembering the theme of ${theme.toLowerCase()}, ${childName} stepped forward with a warm smile and outstretched hands to help.`,
      `Together, they navigated winding trails and overcame unexpected little hurdles. Each step proved that having an open heart and a brave spirit can turn any puzzle into a game of joy.`,
      `By sunset, the whole kingdom cheered for ${childName}. As stars twinkled overhead, everyone celebrated not just the victory, but the kindness shared along the way.`
    ],
    moral: `Always remember: ${moralLesson.toLowerCase()}.`,
    funVocabulary: [
      { word: "Courageous", meaning: "Brave and ready to face difficult things with a warm heart." },
      { word: "Enchanted", meaning: "Filled with special wonder, joy, and delight." }
    ],
    discussionQuestions: [
      `What was your favorite moment of ${childName}'s adventure?`,
      `How can you practice ${moralLesson.toLowerCase()} in your own life today?`
    ]
  };
}

export async function generateStory({ childName, ageGroup, theme, world, moralLesson }) {
  const apiKey = getStoredApiKey() || DEFAULT_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("No API key detected. Providing fallback story.");
    return getFallbackStory({ childName, ageGroup, theme, world, moralLesson });
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

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API error (${response.status}). Using fallback story.`);
      return getFallbackStory({ childName, ageGroup, theme, world, moralLesson });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return getFallbackStory({ childName, ageGroup, theme, world, moralLesson });
    }

    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("API request failed:", err.message, "— Using fallback story.");
    return getFallbackStory({ childName, ageGroup, theme, world, moralLesson });
  }
}
