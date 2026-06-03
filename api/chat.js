/**
 * Vercel Serverless Function — /api/chat
 * Actúa como proxy seguro entre el frontend y la API de Anthropic.
 * Auto-selecciona el mejor modelo disponible (sonnet más reciente).
 * La API key NUNCA se expone al cliente.
 */

// Cache del modelo seleccionado (por vida del proceso serverless)
let cachedModel = null;

/**
 * Obtiene el mejor modelo Claude disponible (sonnet más reciente).
 * Prioriza sonnet por ser el mejor balance calidad/velocidad/precio.
 */
async function getBestModel(apiKey) {
  if (cachedModel) return cachedModel;

  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });

    if (!res.ok) throw new Error(`Models API error: ${res.status}`);

    const data = await res.json();
    const models = data.models || data.data || [];

    // Prioridad: sonnet > haiku > opus (mejor balance calidad/velocidad)
    // Dentro de cada familia, el más reciente primero (orden lexicográfico descendente)
    const priority = ["sonnet", "haiku", "opus"];

    for (const family of priority) {
      const candidates = models
        .map((m) => m.id)
        .filter((id) => id.toLowerCase().includes(family))
        .sort()
        .reverse(); // más reciente primero

      if (candidates.length > 0) {
        cachedModel = candidates[0];
        console.log(`[Picksy] Auto-selected model: ${cachedModel}`);
        return cachedModel;
      }
    }

    // Fallback si no hay ninguno conocido
    cachedModel = models.map((m) => m.id).sort().reverse()[0] || "claude-3-5-sonnet-20241022";
    return cachedModel;

  } catch (err) {
    console.error("[Picksy] Could not fetch models, using fallback:", err.message);
    return "claude-3-5-sonnet-20241022";
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  try {
    // 1. Verificar si hay un override manual en el .env
    const manualModel = process.env.ANTHROPIC_MODEL || process.env.VITE_CLAUDE_MODEL;
    
    // 2. Si no hay override, auto-seleccionar el mejor disponible
    const model = manualModel || await getBestModel(apiKey);

    // Sobrescribir el modelo que venga del cliente
    const body = { ...req.body, model };

    console.log(`[Picksy] Using model: ${model}${manualModel ? ' (Manual Override)' : ''}`);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Picksy] Anthropic error:", data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("[Picksy] Proxy error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
