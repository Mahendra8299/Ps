# AI TTS (Vercel Backend)

This repo provides serverless endpoints for ElevenLabs TTS and Music.

## Files
- `api/tts.ts` — Text-to-Speech endpoint (returns MP3)
- `api/music.ts` — Music endpoint (optional)
- `package.json` — dependencies
- `vercel.json` — Vercel function settings
- `README.md` — instructions

## Deploy Steps
1. Create a new repo on GitHub and upload these files.
2. Import repo into Vercel as a new Project.
3. In Project → Settings → Environment Variables add:
   ELEVENLABS_API_KEY = <your rotated key>
4. Deploy.

Your endpoint will be:
https://<project>.vercel.app/api/tts
(or custom domain if configured)
