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
    const { text, targetLanguage, tone } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "API key belum terbaca.",
        detail: "Pastikan GEMINI_API_KEY sudah ditambahkan di Vercel Environment Variables dan sudah redeploy.",
      });
    }

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: "Text dan bahasa tujuan wajib diisi.",
      });
    }

    const toneMap = {
      natural: "natural dan mudah dipahami",
      formal: "formal, sopan, dan profesional",
      casual: "santai, ringan, dan tetap natural",
      simple: "sederhana, jelas, dan mudah dimengerti",
    };

    const selectedTone = toneMap[tone] || toneMap.natural;

    const prompt = `
Terjemahkan teks berikut ke bahasa ${targetLanguage}.

Aturan:
- Gunakan gaya bahasa ${selectedTone}.
- Pertahankan makna asli.
- Jangan menambahkan penjelasan.
- Jangan menambahkan catatan.
- Balas hanya hasil terjemahannya saja.

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
    console.error("TRANSLATE_ERROR:", error);

    return res.status(500).json({
      error: "Gagal menerjemahkan teks.",
      detail: error.message,
    });
  }
}      translatedText: response.text,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Gagal menerjemahkan teks.",
      detail: error.message,
    });
  }
}
