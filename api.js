import { DEFAULT_API_KEY } from "./config.js";
import { getStoredApiKey, getLanguagePreference, getStoryLength } from "./storage.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function getFallbackStory({ childName, ageGroup, theme, world, moralLesson, language }) {
  const isSpanish = language === "Spanish";

  if (isSpanish) {
    return {
      title: `La Gran Aventura de ${childName}`,
      soundEffect: "✨ ¡Ding! ¡Chispas!",
      paragraphs: [
        `Había una vez, un niño llamado ${childName} que descubrió una puerta mágica en el ${world}.`,
        `Al abrirla, se encontró con amigos que necesitaban ayuda con ${theme.toLowerCase()}.`,
        `${childName} demostró gran amabilidad y alegría en cada paso del camino.`,
        `Al final del día, todos celebraron juntos con una gran fiesta mágica.`
      ],
      moral: `Siempre recuerda: ${moralLesson.toLowerCase()}.`,
      funVocabulary: [{ word: "Amabilidad", meaning: "Tratar a los demás con amor y respeto." }],
      discussionQuestions: [`¿Qué parte de la aventura de ${childName} te gustó más?`]
    };
  }

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
      `Once upon a time, young ${childName} woke up to a gentle breeze carrying a whisper of excitement in the ${world}.`,
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
  const language = getLanguagePreference();
  const storyLength = getStoryLength();

  const lengthInstructions = storyLength === "short" 
    ? "Length: Short bedtime tale. Exactly 2-3 concise paragraphs (under 130 words total)." 
    : "Length: Full adventure. 4-5 descriptive, immersive paragraphs.";

  if (!apiKey || apiKey.trim() === "") {
    console.warn("No API key detected. Providing fallback story.");
    return getFallbackStory({ childName, ageGroup, theme, world, moralLesson, language });
  }

  const systemInstruction = `You are WonderTales, an award-winning children's author and kindergarten teacher.
You write engaging, heartwarming, imaginative, and strictly age-appropriate stories for children.
LANGUAGE: Write the entire story, vocabulary, and questions strictly in ${language}.
${lengthInstructions}
SAFETY RULES:
- Never include violence, danger, scary monsters, mature content, cruelty, or horror.
- Tone must always be warm, uplifting, educational, and fun.
- Tailor vocabulary and sentence length to the ${ageGroup} age group.

You MUST respond ONLY with a raw, valid JSON object (no markdown fences, no triple backticks) matching this exact schema:
{
  "title": "A fun, magical title",
  "soundEffect": "A playful onomatopoeia sound to start",
  "paragraphs": ["First paragraph...", "Second paragraph..."],
  "moral": "One clear, positive moral takeaway sentence.",
  "funVocabulary": [{"word": "word", "meaning": "definition"}],
  "discussionQuestions": ["A question to ask the child."]
}`;

  const userPrompt = `Write a magical story in ${language} for:
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
      return getFallbackStory({ childName, ageGroup, theme, world, moralLesson, language });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return getFallbackStory({ childName, ageGroup, theme, world, moralLesson, language });
    }

    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("API request failed:", err.message, "— Using fallback story.");
    return getFallbackStory({ childName, ageGroup, theme, world, moralLesson, language });
  }
}
