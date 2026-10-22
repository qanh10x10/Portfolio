# Portfolio AI Chat Checkpoint

## Overview & Threat Model

The Portfolio AI Chat is an isolated, fail-closed semantic assistant designed exclusively to answer questions regarding Chu Quang Anh's portfolio, background, experience, technical skills, and game projects. The owner authorized switching from quota-exhausted DeepSeek to Gemini.

To constrain output to approved portfolio content, the runtime uses Gemini 3.8 Flash (or an explicitly configured allowed DeepSeek alias) solely as a **semantic selector of curated fact IDs**. The server renders only pre-approved static strings and local routing paths from `portfolio-facts.mjs`, never model prose, arbitrary URLs, or executable commands. Semantic relevance/refusal still depends on the selector; adversarial live tests are evidence, not a guarantee that every possible off-topic question is classified correctly.

## Architecture & Contract

### 1. Curated Public Knowledge (`portfolio-facts.mjs`)
- Contains 30 curated static facts derived strictly from canonical portfolio sources (`AboutTab.jsx`, `ResumeTab.jsx`, `ContactTab.jsx`, `projects.js`, `stage.js`).
- Covers Chu Quang Anh's identity, Hanoi base, 5 years of Unity development, 4 employment records (ADNX, Rise Up, Gamota, WeeGoon), all 17 projects, 5 browser-playable games, technology stack, and public contact links.
- Every entry provides a stable `id`, `title`, canonical `text`, and verified local `url`.

### 2. HTTP Endpoint (`chat-handler.mjs` mounted at `/api/ask`)
- **Method:** `POST` only (405 on others).
- **Origin:** Strict origin check matching `https://portfolio.hollow-agent.xyz` or local port origin (403 on invalid/missing).
- **Content-Type:** `application/json` (415 on mismatch).
- **Rate Limiting & Concurrency:**
  - Evaluated and synchronously reserved **before** reading the request body.
  - Per-IP limit: default 10 requests / 10 minutes (429 with positive `Retry-After`).
  - Global limit: default 100 requests / 1 hour (429 with positive `Retry-After`).
  - Concurrency limit: default 2 concurrent requests (503 with positive `Retry-After`).
  - Prunes expired records; caps IP map cardinality to 10,000 entries.
  - Socket destruction on rejected unconsumed bodies.
- **Body Bounds:** Maximum 8KiB UTF-8 body, 10s read timeout (408 on timeout, 413 on overflow, 400 on malformed JSON).
- **Payload Schema:**
  - `{ question: string (1-500 chars), previousQuestions?: string[] (max 4, <=200 chars each) }`.
  - Rejects unrecognized keys with 400.

### 3. Model Transport & Upstream Safety
- **Answer-only runtime:** A single completion request with `tool_choice: "none"`, no tool/function definitions, no execution loop, no shell/eval/filesystem/browser tools or Hermes agent session. Responses containing tool/function calls are rejected even if they also contain valid fact IDs. The model cannot initiate contact-form submission or other actions.
- **Endpoint:** `http://127.0.0.1:20127/v1/chat/completions` (configurable via `PORTFOLIO_CHAT_UPSTREAM_URL`).
- **Models:** Default `ag/gemini-3.8-flash`, observed upstream identity `gemini-3.8-flash-n`. Explicit alternatives remain `oc/deepseek-v4.1-flash-free` and `cbai/deepseek-v4.1-flash`; no silent fallback. Gemini requests strict JSON schema; model identity and exact IDs are still validated server-side.
- **Auth:** `PORTFOLIO_CHAT_API_KEY` (supplied via environment; returns 503 if omitted).
- **Upstream Handling:** 20s timeout via `AbortController`, bounded upstream response (16KiB max). Non-JSON, non-2xx, or malformed choices fail closed with safe 503 without echoing upstream text or canaries.
- **Selection & Rendering:** Model returns exactly `{"ids": [...]}` with at most 4 unique, known string IDs. Extra keys, unknown/duplicate IDs, markdown, or malformed content are rejected, not repaired. Empty IDs return a fixed refusal (English or Vietnamese). The request allows 1,024 total completion tokens because DeepSeek also spends tokens on hidden reasoning; visible output is still limited to IDs. The response's `model` must match the requested alias or its native name; mismatches fail closed.
- **Response Shape:**
  ```json
  {
    "ok": true,
    "refused": false,
    "refusal": null,
    "answer": "...",
    "sources": [{ "title": "...", "url": "..." }],
    "facts": [{ "id": "...", "title": "...", "text": "...", "url": "..." }]
  }
  ```

### 4. UI Component (`HollowGameArchive/src/components/PortfolioChat.jsx`)
- Self-contained responsive component styled with dark slate/ivory/gold CRT aesthetic (`portfolio-chat.css`).
- Region labeled: `role="region" aria-label="Quang Anh’s AI assistant"`.
- Textbox: `role="textbox" aria-label="Ask a question about Quang Anh's portfolio"`.
- Submit button: Accessible `Send` button.
- Clear disclaimer: *"Answers only from this portfolio. Not the real Quang Anh."*
- Curated question suggestion chips.
- Bounded chat history (20 messages max), explicit loading state, disabled duplicate submissions.
- Input preserved on error for seamless user retry; no localStorage persistence.
- Reflows down to 320px with 44px minimum touch targets.

## Verification & Test Commands

To execute the full security, rate limiting, and transport test suite:
```bash
node test-chat.mjs
```

To run existing regression tests:
```bash
node test-server.mjs
node test-contact.mjs
```

## Owned Files
- `portfolio-facts.mjs`
- `chat-handler.mjs`
- `test-chat.mjs`
- `CHAT.md`
- `server.mjs`
- `HollowGameArchive/src/components/PortfolioChat.jsx`
- `HollowGameArchive/src/styles/portfolio-chat.css`
