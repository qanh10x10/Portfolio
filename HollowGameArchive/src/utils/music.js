// ponytail: minimal production music track validator for /api/music and LocalMusicPlayer.
export function isValidTrack(track) {
  if (!track || typeof track !== 'object') return false;
  if (typeof track.id !== 'string' || !track.id.trim() || track.id.startsWith('.') || /[\\/\x00-\x1f\x7f]/.test(track.id) || !/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(track.id) || new TextEncoder().encode(track.id).length > 255) return false;
  if (typeof track.url !== 'string' || !track.url.startsWith('/media/music/')) return false;
  if (track.title !== undefined && (typeof track.title !== 'string' || !track.title.trim())) return false;
  try { return track.url === `/media/music/${encodeURIComponent(track.id)}`; }
  catch { return false; }
}
