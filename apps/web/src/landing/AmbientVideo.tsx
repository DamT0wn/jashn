import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { shouldLoadVideo } from './media-policy';

/** Keep src absent until motion/data preferences and viewport permit loading. */
export function AmbientVideo({ src, label, eager = false }: { src: string; label: string; eager?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const near = useInView(host, { margin: '100px', once: true });
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [paused, setPaused] = useState(false);
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const load = shouldLoadVideo({ reducedMotion: reduced, saveData: Boolean(connection?.saveData), requested, paused, failed, near: eager || near });
  const activePlaying = load && playing;
  useEffect(() => {
    if (!load) video.current?.pause();
  }, [load]);
  async function toggle() {
    if (activePlaying) { video.current?.pause(); setPlaying(false); setPaused(true); setRequested(false); }
    else { setPaused(false); setRequested(true); try { await video.current?.play(); } catch { /* onCanPlay retries once loaded */ } }
  }
  return <div ref={host} className={`ambient ambient-${label}`}>
    <div className="static-scene" aria-hidden="true"><div className="scene-orbit" /><div className="scene-orbit second" /><div className="scene-light" /></div>
    {load ? <video ref={video} src={src} autoPlay loop muted playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false); }} onCanPlay={() => { void video.current?.play().catch(() => setPlaying(false)); }} /> : null}
    <div className="video-shade" aria-hidden="true" /><div className="noise-overlay" aria-hidden="true" />
    <button className="media-control" onClick={() => { void toggle(); }} disabled={failed} aria-label={failed ? `${label} video unavailable` : `${activePlaying ? 'Pause' : 'Play'} ${label} video`}>
      {activePlaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}<span>{failed ? 'Still scene' : activePlaying ? 'Pause motion' : 'Play motion'}</span>
    </button>
  </div>;
}
