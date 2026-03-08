# 🔥 Gaslight-a-Bot

Chat with an AI, then **edit its responses** to make it think it said something completely different. Watch it spiral into confusion, apologize for things it never said, or double down on increasingly unhinged takes.

## How it works

LLMs don't actually remember conversations. Every time you send a message, the entire conversation history gets re-sent to the model. This means if you **edit a previous message** in that history, the AI genuinely believes the edited version is what happened.

This tool lets you do exactly that:

1. **Chat** with any model through [Hack Club AI](https://ai.hackclub.com)
2. **Edit** any message (yours or the bot's) by clicking the edit button
3. **Continue chatting** — the AI now thinks your edited version is the real conversation
4. **Watch** as the AI tries to reconcile a reality that never existed

## Setup

You'll need [Node.js](https://nodejs.org) and a [Hack Club AI](https://ai.hackclub.com) API key.

```bash
git clone https://github.com/YOUR_USERNAME/gaslighting.git
cd gaslighting
node server.js
```

Open **http://localhost:3000**, paste your API key, and start gaslighting.

### Why the server?

The Hack Club AI API doesn't allow browser requests from `localhost` (CORS). The included `server.js` is a tiny zero-dependency Node proxy that forwards your API calls and serves the page.

## Models

Pick from 8+ models in the dropdown:

- Gemini 2.5 Flash
- GPT-5 Mini / GPT-OSS 120B
- DeepSeek R1 / DeepSeek V3.2
- Qwen3 32B
- Kimi K2
- GLM 4.6

## Features

- **Edit any message** — user or assistant, click edit, rewrite history
- **Streamed responses** — tokens appear in real-time
- **System prompt** — customize the AI's personality before gaslighting it
- **Model switching** — swap models mid-conversation
- **API key persistence** — saved in localStorage so you don't re-enter it
- **Zero dependencies** — just Node.js and a browser

## Project structure

```
index.html    — the entire frontend (single file, no build step)
server.js     — lightweight Node.js proxy server
README.md     — you are here
```

## Credits

Powered by [Hack Club AI](https://ai.hackclub.com) — free AI access for teens.

Inspired by [this video](https://www.youtube.com/watch?v=) about gaslighting LLMs through conversation history manipulation.
