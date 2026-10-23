# Local music

Add owner-authorized audio directly to `/data/portfolio-media/music` on the server. Files live outside the repo and build directory, so deployments do not replace them. No music is bundled or downloaded.

- Formats: `.mp3`, `.m4a`, `.aac`, `.ogg`, `.opus`, `.wav`, `.flac`, `.webm` (actual playback depends on the browser codec).
- Direct files only; hidden files, directories and symlinks are not served.
- Filename stem is the displayed title. Use `01 - Title.mp3`, `02 - Title.mp3` for natural playlist order.
- Reopen the speaker or choose **Refresh playlist** after adding/removing files; no build or service restart is needed.
- No autoplay. Playback begins only after the visitor chooses Play; empty/error states do not claim music is playing.
- The folder's contents are publicly streamable via `/media/music/…`; never put private material in it.

`MUSIC_DIR` can override the server directory. `GET /api/music` returns `{tracks:[{id,title,url}]}`; media supports GET/HEAD and byte ranges. A missing folder is an empty playlist, while a directory read failure returns HTTP 503.

Runnable checks: `node test-music.mjs` and `node test-server.mjs`.
