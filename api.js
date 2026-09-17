export const GeminiService = {
  async generateStory(params, apiKey) {
    if (!apiKey || !apiKey.trim()) {
      return this.getDemoStory(params);
    }

    const { character, theme, ageGroup, moral, extra } = params;

    const prompt = `You are a children's storybook author. Write an age-appropriate, heartwarming story for children (${ageGroup}).
No violence, no scary content, no mature themes.

Story requirements:
- Hero / Character: ${character}
- Setting: ${theme}
- Age: ${ageGroup}
- Moral Lesson: ${moral}
${extra ? `- Extra detail: ${extra}` : ''}

Respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Story Title",
  "paragraphs": ["First paragraph...", "Second paragraph...", "Third paragraph..."],
  "moral": "The 1-sentence lesson learned",
  "funVocabulary": [{"word": "Word", "definition": "Simple definition"}]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Gemini returned an empty response. Please try again.');
    }

    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(rawText);

    return {
      title: parsed.title || 'A Magical Adventure',
      paragraphs: parsed.paragraphs || [rawText],
      moral: parsed.moral || 'Kindness is magical.',
      funVocabulary: parsed.funVocabulary || [],
      theme,
      ageGroup
    };
  },

  getDemoStory(params) {
    const char = params.character || 'Barnaby Bunny';
    return {
      title: `${char} and the Glowing Starflower`,
      paragraphs: [
        `Deep in the Enchanted Woods, morning sunlight danced across the trees as ${char} hopped happily along the path.`,
        `Beside the brook, ${char} found a tiny starflower glowing with soft blue light. He held it high to help an elderly hedgehog find his way home.`,
        `As soon as ${char} shared the light, the starflower blossomed twice as bright. He smiled, learning that kindness makes every adventure magical.`
      ],
      moral: `When you help a friend, the whole world shines brighter (${params.moral || 'Kindness'}).`,
      funVocabulary: [{ word: "Glowing", definition: "Shining with a gentle light." }],
      theme: params.theme || 'Enchanted Woods',
      ageGroup: params.ageGroup || '6-8 yrs'
    };
  }
};
