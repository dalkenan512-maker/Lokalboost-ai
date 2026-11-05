export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sadece POST isteği kabul edilir." });
  }

  const message = req.body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Bir mesaj yazmalısın." });
  }

  if (message.length > 4000) {
    return res.status(400).json({ error: "Mesaj çok uzun." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Yapay zekâ bağlantısı henüz ayarlanmadı." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions: "Sen LokalBoost AI'nin Türkçe dijital asistanısın. Kullanıcının ne yapmak istediğini anla. Gerektiğinde tek tek açıklayıcı sorular sor. Uygulanabilir, gerçekçi ve adım adım planlar hazırla. Yapmadığın bir işi yapmış gibi gösterme. Maliyetleri ve riskleri açıkça belirt.",
        input: message,
        max_output_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({ error: "Yapay zekâ şu anda cevap veremedi." });
    }

    const answer = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Bağlantı hatası oluştu." });
  }
}
