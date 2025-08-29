import { IncomingMessage, ServerResponse } from "http";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

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
    const { prompt, musicLengthMs = 10000 } =
      JSON.parse(Buffer.concat(chunks).toString() || "{}");

    if (!prompt || String(prompt).trim() === "") return send(res, 400, "Missing prompt");

    const client = new ElevenLabsClient({ apiKey });
    const track = await client.music.composeDetailed({ prompt, musicLengthMs });

    const audio = Buffer.from(await track.audio.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="music.mp3"`);
    res.statusCode = 200;
    res.end(audio);
  } catch (e: any) {
    send(res, 500, e?.message || "Server error");
  }
}
