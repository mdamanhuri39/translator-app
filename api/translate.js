export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "API key belum terbaca.",
        detail: "Pastikan GEMINI_API_KEY sudah ada di Vercel Environment Variables dan sudah redeploy.",
      });
    }

    const { text, targetLanguage, tone } = req.body || {};

    if (!text || !targetLanguage) {
      return res.status(400).json({
        error: "Teks dan bahasa tujuan wajib diisi.",
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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: "Gemini API error.",
        detail: data?.error?.message || "Terjadi kesalahan dari Gemini API.",
      });
    }

    const translatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!translatedText) {
      return res.status(500).json({
        error: "Hasil terjemahan kosong.",
        detail: "Gemini tidak mengembalikan teks terjemahan.",
      });
    }

    return res.status(200).json({
      translatedText,
    });
  } catch (error) {
    console.error("TRANSLATE_ERROR:", error);

    return res.status(500).json({
      error: "Gagal menerjemahkan teks.",
      detail: error.message || "Unknown error",
    });
  }
}
