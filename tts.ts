import { IncomingMessage, ServerResponse } from "http";
import { fetch } from "undici";

const apiKey = process.env.ELEVENLABS_API_KEY;

function send(res: ServerResponse & { setHeader: any }, code: number, body: string) {
  res.statusCode = code;
  res.end(body);
}

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse & { setHeader: any }) {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return send(res, 204, "");

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS");
      return send(res, 405, "Method Not Allowed");
    }
    if (!apiKey) return send(res, 500, "Server missing ELEVENLABS_API_KEY");

    const chunks: Uint8Array[] = [];
    for await (const chunk of req) chunks.push(chunk as Uint8Array);
    const { text, voice_id = "21m00Tcm4TlvDq8ikWAM", model_id = "eleven_multilingual_v2" } =
      JSON.parse(Buffer.concat(chunks).toString() || "{}");

    if (!text || String(text).trim() === "") return send(res, 400, "Missing text");

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id,
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3 },
        optimize_streaming_latency: 0
      })
    });

    if (!r.ok) {
      const msg = await r.text();
      return send(res, r.status, msg || "TTS error");
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="voice.mp3"`);
    res.statusCode = 200;
    res.end(buf);
  } catch (e: any) {
    send(res, 500, e?.message || "Server error");
  }
}
