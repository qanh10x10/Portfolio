import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isValidTrack } from '../utils/music.js';

// ponytail: local audio client backed by GET /api/music; native HTMLAudioElement with strict encoded ID verification; preload=none; no fake artists or synthetic fallbacks.
export default function LocalMusicPlayer({ isFocused = false, style = {} }) {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [playbackError, setPlaybackError] = useState('');
  const [isTrackUnavailable, setIsTrackUnavailable] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;
  const prevIsFocusedRef = useRef(false);
  const fetchGenRef = useRef(0);
  const abortControllerRef = useRef(null);

  const fetchPlaylist = useCallback(async () => {
    const gen = ++fetchGenRef.current;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrorMessage('');
    setPlaybackError('');

    try {
      const res = await fetch('/api/music', { credentials: 'same-origin', credentialsMode: 'same-origin', signal: controller.signal });
      const data = await res.json().catch(() => null);

      if (gen !== fetchGenRef.current) return;

      if (res.status === 503 || !res.ok) {
        setErrorMessage(data?.error || 'Local music playlist is temporarily unavailable.');
        return;
      }

      if (data && Array.isArray(data.tracks) && data.tracks.every(isValidTrack)) {
        const validTracks = data.tracks.map((t) => ({
          ...t,
          title: t.title || t.id.replace(/\.[^/.]+$/, ''),
        }));

        setTracks(validTracks);

        setSelectedTrackId((prevSelectedId) => {
          if (prevSelectedId) {
            const stillExists = validTracks.some((t) => t.id === prevSelectedId);
            if (!stillExists) {
              // Stop and show unavailable on selected removal
              const audio = audioRef.current;
              if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
              }
              setIsPlaying(false);
              setIsTrackUnavailable(true);
              return prevSelectedId;
            } else {
              setIsTrackUnavailable(false);
              return prevSelectedId;
            }
          }
          setIsTrackUnavailable(false);
          return validTracks.length > 0 ? validTracks[0].id : null;
        });
      } else {
        setErrorMessage('Invalid music playlist response from server.');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (gen !== fetchGenRef.current) return;
      setErrorMessage('Network error fetching playlist.');
    } finally {
      if (gen === fetchGenRef.current) {
        setLoading(false);
        setHasFetched(true);
      }
    }
  }, []);

  // Refetch on EVERY reopen, not only !hasFetched
  useEffect(() => {
    if (isFocused && !prevIsFocusedRef.current) {
      fetchPlaylist();
    }
    prevIsFocusedRef.current = isFocused;
  }, [isFocused, fetchPlaylist]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || null;

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || isTrackUnavailable) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setPlaybackError('');
      // Assign src only on play to ensure preload="none" / no media request before Play
      const targetSrc = currentTrack.url;
      if (audio.getAttribute('src') !== targetSrc) {
        audio.src = targetSrc;
      }

      audio.play().catch((err) => {
        setIsPlaying(false);
        setPlaybackError(err.name === 'NotAllowedError' ? 'Play rejected by browser policy' : 'Playback error');
      });
    }
  };

  const handleSelectTrack = (trackId) => {
    if (trackId === selectedTrackId) {
      handleTogglePlay();
      return;
    }

    const nextTrack = tracks.find((t) => t.id === trackId);
    if (!nextTrack) return;

    setSelectedTrackId(trackId);
    setIsTrackUnavailable(false);
    setPlaybackError('');

    // Active-track selection must NOT auto-play while paused:
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingRef.current) {
      audio.src = nextTrack.url;
      audio.play().catch((err) => {
        setIsPlaying(false);
        setPlaybackError('Playback error');
      });
    } else {
      // Keep paused, preload="none" / no media request before play
      audio.removeAttribute('src');
    }
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === selectedTrackId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handleSelectTrack(tracks[prevIndex].id);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === selectedTrackId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handleSelectTrack(tracks[nextIndex].id);
  };

  const handleAudioEnded = () => {
    if (tracks.length > 1) {
      const currentIndex = tracks.findIndex((t) => t.id === selectedTrackId);
      const nextIndex = (currentIndex + 1) % tracks.length;
      const nextTrack = tracks[nextIndex];
      setSelectedTrackId(nextTrack.id);
      setIsTrackUnavailable(false);

      const audio = audioRef.current;
      if (audio) {
        audio.src = nextTrack.url;
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setPlaybackError('Audio decode error');
  };

  const hasNoTracks = tracks.length === 0;
  const statusLabel = loading
    ? 'Loading...'
    : errorMessage
    ? 'Service unavailable'
    : isTrackUnavailable
    ? 'Selected track unavailable'
    : playbackError
    ? playbackError
    : hasNoTracks
    ? 'Empty playlist'
    : isPlaying
    ? 'Playing'
    : 'Paused';

  return (
    <section
      id="hvl-player"
      data-focus-surface="music"
      data-object-id="music"
      className="object-surface"
      style={style}
      aria-label="Local Music Player"
    >
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      <div className="music-topline">
        <span>Local Music Player</span>
        <span className="music-preview-state">{statusLabel}</span>
      </div>

      <div className="music-layout">
        <div className="music-art-box">
          <img
            src="/assets/images/site/avatar.jpg"
            alt="Chu Quang Anh avatar"
          />
        </div>
        <div className="music-copy">
          <h1>
            {isTrackUnavailable
              ? 'Track Unavailable'
              : currentTrack
              ? currentTrack.title
              : loading
              ? 'Loading...'
              : 'Local Playlist'}
          </h1>
          <p>
            {isTrackUnavailable
              ? 'The selected track is no longer in the playlist.'
              : currentTrack
              ? 'Local audio track'
              : errorMessage || 'Add audio files to local music folder'}
          </p>
          <button
            type="button"
            className="music-refresh-link"
            onClick={fetchPlaylist}
            disabled={loading}
            aria-label="Refresh playlist"
          >
            {loading ? 'Refreshing...' : 'Refresh playlist ⟳'}
          </button>
        </div>
      </div>

      <div className="music-controls">
        <button
          type="button"
          aria-label="Previous track"
          disabled={hasNoTracks || loading || isTrackUnavailable}
          onClick={handlePrevTrack}
        >
          Previous
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={hasNoTracks || loading || isTrackUnavailable}
          onClick={handleTogglePlay}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          aria-label="Next track"
          disabled={hasNoTracks || loading || isTrackUnavailable}
          onClick={handleNextTrack}
        >
          Next
        </button>
      </div>

      <div className="music-track-container">
        {errorMessage ? (
          <p className="music-note music-error" role="alert">{errorMessage}</p>
        ) : hasNoTracks && hasFetched ? (
          <p className="music-note">No tracks found. Place audio files (.mp3, .ogg, .flac) in local music folder.</p>
        ) : (
          <ul className="music-track-list" aria-label="Available audio tracks">
            {tracks.map((t, idx) => {
              const isSelected = t.id === selectedTrackId;
              return (
                <li key={t.id} className={isSelected ? 'active-track' : ''}>
                  <button
                    type="button"
                    onClick={() => handleSelectTrack(t.id)}
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    <span className="track-index">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="track-title">{t.title}</span>
                    {isSelected && isPlaying && <span className="track-indicator">▶</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
