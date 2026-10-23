import assert from 'node:assert/strict';
import { isValidTrack } from '../src/utils/music.js';

console.log('Running production isValidTrack unit tests...');

// 1. Valid tracks with ASCII, spaces, and UTF-8 characters
assert.equal(isValidTrack({ id: 'song-1.mp3', url: '/media/music/song-1.mp3' }), true);
assert.equal(isValidTrack({ id: '01 - PCM fixture.wav', url: '/media/music/01%20-%20PCM%20fixture.wav' }), true);
assert.equal(isValidTrack({ id: '02 - Tiếng Việt.wav', title: '02 - Tiếng Việt', url: '/media/music/02%20-%20Ti%E1%BA%BFng%20Vi%E1%BB%87t.wav' }), true);
assert.equal(isValidTrack({ id: 'track#hash.ogg', url: '/media/music/track%23hash.ogg' }), true);

// 2. Reject malicious, external, or malformed URLs
assert.equal(isValidTrack({ id: 'song.mp3', url: 'https://evil.com/media/music/song.mp3' }), false);
assert.equal(isValidTrack({ id: 'song.mp3', url: '//evil.com/media/music/song.mp3' }), false);
assert.equal(isValidTrack({ id: 'song.mp3', url: '/media/music/other.mp3' }), false);
assert.equal(isValidTrack({ id: 'song.mp3', url: '/media/music/song.mp3?malicious=1' }), false);
for (const id of ['../secret.mp3', 'nested/song.wav', 'nested\\song.wav', '.hidden.wav', 'bad\u0001.wav', '\ud800.wav', 'not-audio.txt', 'x'.repeat(256) + '.wav']) {
  const url = id === '\ud800.wav' ? '/media/music/bad.wav' : `/media/music/${encodeURIComponent(id)}`;
  assert.equal(isValidTrack({ id, url }), false, `reject unsafe filename ${JSON.stringify(id)}`);
}

// 3. Reject nullish, empty, or non-object structures
assert.equal(isValidTrack(null), false);
assert.equal(isValidTrack(undefined), false);
assert.equal(isValidTrack('not-a-track'), false);
assert.equal(isValidTrack({}), false);
assert.equal(isValidTrack({ id: '', url: '/media/music/' }), false);
assert.equal(isValidTrack({ id: '   ', url: '/media/music/' }), false);
assert.equal(isValidTrack({ id: 'valid.mp3', url: 123 }), false);
assert.equal(isValidTrack({ id: 'valid.mp3', title: '   ', url: '/media/music/valid.mp3' }), false);

console.log('PASS: isValidTrack production helper verified successfully.');
