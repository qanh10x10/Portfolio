import React, { useState, useRef, useEffect } from 'react';
import '../styles/portfolio-chat.css';

// ponytail: client-side chat interface; strictly renders server-verified text & sources; no markdown parsing or local storage persistence.

const SUGGESTIONS = [
  'What game engines and languages do you use?',
  'Which games can I play in the browser right now?',
  'Tell me about your work on Tinh Thien Ha 1 and ADNX.',
  'How can I contact Quang Anh?',
  'Bạn có kinh nghiệm làm MMORPG không?',
];

export default function PortfolioChat({ style = {} }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const [previousQuestions, setPreviousQuestions] = useState([]);

  const logEndRef = useRef(null);
  const inputRef = useRef(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (logEndRef.current) {
      const log = logEndRef.current.parentElement;
      if (log) log.scrollTop = log.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (questionText) => {
    const trimmed = (questionText || input).trim();
    if (!trimmed || inFlight.current) return;
    inFlight.current = true;

    setErrorStatus('');
    setIsLoading(true);

    const userMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev.slice(-19), userMessage]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmed,
          previousQuestions: previousQuestions.slice(-4),
        }),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || !data.ok) {
        const errorMsg =
          data?.error ||
          (res.status === 429
            ? 'Rate limit reached. Please wait a moment before asking again.'
            : res.status === 503
            ? 'The AI assistant is busy or temporarily unavailable. Please try again shortly.'
            : 'Failed to get an answer. Please retry.');

        setErrorStatus(errorMsg);
        setMessages((prev) => [
          ...prev.slice(-19),
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: errorMsg,
            isError: true,
          },
        ]);
        setInput(trimmed);
      } else {
        setPreviousQuestions((prev) => [...prev.slice(-3), trimmed.slice(0, 200)]);
        setInput('');

        const assistantMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.answer || data.refusal || '',
          sources: Array.isArray(data.sources)
            ? data.sources
            : Array.isArray(data.facts)
            ? data.facts.map((f) => ({ title: f.title, url: f.url }))
            : [],
          refused: Boolean(data.refused),
        };

        setMessages((prev) => [...prev.slice(-19), assistantMessage]);
      }
    } catch {
      const networkError = 'Network error or request timeout. Please check your connection and retry.';
      setErrorStatus(networkError);
      setMessages((prev) => [
        ...prev.slice(-19),
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: networkError,
          isError: true,
        },
      ]);
      setInput(trimmed);
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const onSubmitForm = (e) => {
    e.preventDefault();
    handleSend();
  };

  const onSelectSuggestion = (text) => {
    if (isLoading) return;
    setInput(text);
    handleSend(text);
  };

  return (
    <section
      id="robot-chat"
      data-focus-surface="chat"
      className="object-surface"
      style={style}
      aria-label="Quang Anh’s AI assistant"
    >
      <div className="holo-chat-head" aria-hidden="true">
        <span className="holo-chat-reactor" />
        <span className="holo-chat-title">AI ASSISTANT</span>
        <span className="holo-chat-status">ONLINE</span>
      </div>

      <div className="chat-preview-content">
        <h1>Quang Anh’s AI assistant</h1>
        <p className="assistant-scope">Answers only from this portfolio. Not the real Quang Anh.</p>

        <div className="portfolio-chat-log" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <p className="assistant-empty">
              Ask questions about Chu Quang Anh’s Unity experience, shipped games, technical skills, or playable demos.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`portfolio-chat-msg portfolio-chat-msg-${msg.role} ${
                  msg.isError ? 'portfolio-chat-msg-error' : ''
                }`}
              >
                <span className="portfolio-chat-msg-role">
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <p className="portfolio-chat-msg-text">{msg.text}</p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="portfolio-chat-sources">
                    <span className="portfolio-chat-sources-label">Sources:</span>
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={
                          typeof src.url === 'string' &&
                          /^\/(?:about|contact|resume(?:#(?:skills|experience))?|portfolio\/[A-Za-z0-9]+)$/.test(src.url)
                            ? src.url
                            : '/about'
                        }
                        className="portfolio-chat-source-link"
                      >
                        {src.title} &rarr;
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="portfolio-chat-loading-row" aria-live="polite">
              <span className="portfolio-chat-spinner" aria-hidden="true" />
              <span>Consulting portfolio facts...</span>
            </div>
          )}

          <div ref={logEndRef} aria-hidden="true" />
        </div>
      </div>

      <div className="portfolio-chat-suggestions" aria-label="Suggested Questions">
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            className="portfolio-chat-suggestion-chip"
            disabled={isLoading}
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <form className="crt-input" onSubmit={onSubmitForm} noValidate>
        <input
          ref={inputRef}
          type="text"
          role="textbox"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about projects, skills, experience..."
          aria-label="Ask a question about Quang Anh's portfolio"
          disabled={isLoading}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send"
        >
          Send
        </button>
      </form>
    </section>
  );
}
