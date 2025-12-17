# AI Agent Cirrascale (Browser-Based)

AI Agent Cirrascale is a lightweight, GitHub Pages–hosted, browser-only AI agent interface built with HTML/CSS/JS.

## Features
- Chat UI (user + assistant)
- Local conversation persistence via LocalStorage
- Provider architecture:
  - Demo (offline) mode works immediately
  - OpenAI-compatible mode via an API proxy you control

## Run locally (optional, for testing)
You can open `index.html` directly, but a static server is recommended:

- VS Code Live Server, or
- `python3 -m http.server 8080`

Then visit `http://localhost:8080`.

## Deploy to GitHub Pages
1. Create a GitHub repo, e.g. `ai-agent-cirrascale`
2. Add `index.html`, `styles.css`, `app.js`, `README.md` to the repo root
3. In GitHub: **Settings → Pages**
4. Source: `Deploy from a branch`
5. Branch: `main` and `/ (root)`
6. Save, then open the Pages URL

## Provider: OpenAI-Compatible (Recommended via Proxy)
Do not embed API keys in the browser.

Instead:
1. Create a serverless proxy (Cloudflare Workers / Vercel / Netlify functions / AWS Lambda)
2. The proxy should:
   - Accept requests from your GitHub Pages origin (CORS)
   - Inject your API key server-side
   - Forward the request to your model provider endpoint
3. In Cirrascale UI:
   - Provider: `OpenAI-Compatible (via proxy)`
   - API base URL: `https://your-proxy.example.com`
   - Model: your chosen model id

### Endpoint shape
The app calls:
`POST {BASE_URL}/v1/chat/completions`
with JSON:
```json
{
  "model": "your-model",
  "messages": [{"role":"system","content":"..."},{"role":"user","content":"..."}],
  "temperature": 0.2
}
