import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: "Text dan bahasa tujuan wajib diisi.",
      });
    }

    const prompt = `
Terjemahkan teks berikut ke bahasa ${targetLanguage}.
Balas hanya hasil terjemahannya saja, tanpa penjelasan tambahan.

Teks:
${text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return res.status(200).json({
      translatedText: response.text,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Gagal menerjemahkan teks.",
      detail: error.message,
    });
  }
}
