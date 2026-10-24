import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../src/components/PortfolioChat.jsx', import.meta.url), 'utf8');
const handler = source.slice(source.indexOf('  const handleSend ='), source.indexOf('  const onSubmitForm ='));

test('chat clears the submitted input while pending and restores it only on failure', async () => {
  for (const outcome of ['success', 'http-error', 'network-error', 'malformed']) {
    const state = { input: '  Unity experience?  ', messages: [], loading: false, calls: 0 };
    let resolve, reject;
    const response = new Promise((yes, no) => { resolve = yes; reject = no; });
    const inFlight = { current: false };
    const context = {
      input: state.input, previousQuestions: [], inFlight, inputRef: { current: null }, AbortController, setTimeout, clearTimeout,
      setInput: value => { state.input = value; },
      setIsLoading: value => { state.loading = value; },
      setErrorStatus: () => {}, setPreviousQuestions: () => {},
      setMessages: fn => { state.messages = fn(state.messages); },
      fetch: (url, options) => {
        state.calls++;
        assert.equal(url, '/api/ask');
        assert.equal(JSON.parse(options.body).question, 'Unity experience?');
        return response;
      },
    };
    const send = vm.runInNewContext(`${handler}\nhandleSend;`, context);
    const pending = send();
    try {
      assert.equal(state.input, '', 'composer must be empty before the response arrives');
      assert.equal(state.loading, true);
      assert.equal(state.messages.at(-1).text, 'Unity experience?');
      await send();
      assert.equal(state.calls, 1, 'a repeated submit cannot duplicate the pending request');
    } finally {
      if (outcome === 'network-error') reject(new TypeError('offline'));
      else resolve({ ok: outcome !== 'http-error', status: outcome === 'http-error' ? 503 : 200, json: async () => {
        if (outcome === 'malformed') throw new SyntaxError('bad JSON');
        return outcome === 'http-error' ? { ok: false, error: 'Unavailable' } : { ok: true, answer: 'Unity developer', sources: [] };
      } });
      await pending;
    }
    assert.equal(state.input, outcome === 'success' ? '' : 'Unity experience?');
    assert.equal(state.loading, false);
    assert.equal(inFlight.current, false);
    assert.equal(Boolean(state.messages.at(-1).isError), outcome !== 'success');
  }
});
