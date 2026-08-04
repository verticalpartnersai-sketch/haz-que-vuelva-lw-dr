"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const fullVolume = 1;
const duckedVolume = 0.34;

type BrowserWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useQuizSoundscape(sessionHydrated: boolean) {
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [audioNeedsGesture, setAudioNeedsGesture] = useState(false);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const ensureAudioGraph = useCallback(() => {
    const ambientAudio = ambientAudioRef.current;
    if (!ambientAudio || typeof window === "undefined") return null;
    if (audioContextRef.current && ambientGainRef.current) {
      return {
        context: audioContextRef.current,
        gain: ambientGainRef.current,
      };
    }

    const AudioContextClass =
      window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;
    if (!AudioContextClass) return null;

    const context = new AudioContextClass();
    const gain = context.createGain();
    const source = context.createMediaElementSource(ambientAudio);
    gain.gain.value = fullVolume;
    source.connect(gain).connect(context.destination);
    audioContextRef.current = context;
    ambientGainRef.current = gain;
    ambientSourceRef.current = source;
    return { context, gain };
  }, []);

  const playAmbientAudio = useCallback(
    (restart = false, muted = audioMuted) => {
      const ambientAudio = ambientAudioRef.current;
      if (!ambientAudio) return;
      if (restart) ambientAudio.currentTime = 0;
      ambientAudio.loop = true;
      ambientAudio.muted = muted;
      ambientAudio.volume = fullVolume;
      if (ambientGainRef.current) {
        ambientGainRef.current.gain.value = muted ? 0 : fullVolume;
      }
      void ambientAudio
        .play()
        .then(() => setAudioNeedsGesture(false))
        .catch(() => setAudioNeedsGesture(true));
    },
    [audioMuted],
  );

  useEffect(() => {
    if (!sessionHydrated) return;
    const ambientAudio = ambientAudioRef.current;
    if (!ambientAudio) return;

    ambientAudio.loop = true;
    ambientAudio.volume = fullVolume;
    ambientAudio.muted = audioMuted;
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.value = audioMuted ? 0 : fullVolume;
    }

    if (!audioStarted) {
      ambientAudio.pause();
      return;
    }

    void ambientAudio
      .play()
      .then(() => setAudioNeedsGesture(false))
      .catch(() => setAudioNeedsGesture(true));
  }, [audioMuted, audioStarted, sessionHydrated]);

  useEffect(
    () => () => {
      ambientAudioRef.current?.pause();
      ambientSourceRef.current?.disconnect();
      ambientGainRef.current?.disconnect();
      const context = audioContextRef.current;
      if (context && context.state !== "closed") void context.close();
    },
    [],
  );

  const restoreAudioState = useCallback((started: boolean, muted: boolean) => {
    setAudioStarted(started);
    setAudioMuted(muted);
  }, []);

  function startSoundscape() {
    const ambientAudio = ambientAudioRef.current;
    if (ambientAudio) {
      ambientAudio.currentTime = 0;
      ambientAudio.loop = true;
      ambientAudio.muted = false;
      ambientAudio.volume = fullVolume;
    }

    const graph = ensureAudioGraph();
    if (graph) {
      graph.gain.gain.value = fullVolume;
      if (graph.context.state === "suspended") {
        void graph.context.resume();
      }
    }

    // Keep the first play() inside the CTA's user gesture. Mobile Chrome
    // rejects audible playback when it is deferred to a React effect.
    playAmbientAudio(true, false);
    setAudioStarted(true);
    setAudioMuted(false);
    setAudioNeedsGesture(false);
  }

  function toggleAmbientAudio() {
    const ambientAudio = ambientAudioRef.current;
    if (!audioStarted || audioMuted) {
      setAudioStarted(true);
      setAudioMuted(false);
      const graph = ensureAudioGraph();
      if (graph?.context.state === "suspended") void graph.context.resume();
      playAmbientAudio(false, false);
      return;
    }

    ambientAudio?.pause();
    if (ambientGainRef.current) ambientGainRef.current.gain.value = 0;
    setAudioMuted(true);
    setAudioNeedsGesture(false);
  }

  function resumeAmbientAudio() {
    if (!audioNeedsGesture || audioMuted || !audioStarted) return;
    const graph = ensureAudioGraph();
    if (graph?.context.state === "suspended") void graph.context.resume();
    playAmbientAudio();
  }

  const playNotificationChime = useCallback(() => {
    if (audioMuted || !audioStarted || document.visibilityState !== "visible") {
      return;
    }

    const graph = ensureAudioGraph();
    if (!graph) return;
    const { context, gain: ambientGain } = graph;
    if (context.state === "suspended") void context.resume();

    const now = context.currentTime;
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(duckedVolume, now + 0.055);
    ambientGain.gain.setValueAtTime(duckedVolume, now + 0.42);
    ambientGain.gain.exponentialRampToValueAtTime(fullVolume, now + 0.86);

    const chimeGain = context.createGain();
    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.085, now + 0.012);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    chimeGain.connect(context.destination);

    const firstTone = context.createOscillator();
    firstTone.type = "sine";
    firstTone.frequency.setValueAtTime(783.99, now);
    firstTone.frequency.exponentialRampToValueAtTime(830.61, now + 0.2);
    firstTone.connect(chimeGain);
    firstTone.start(now);
    firstTone.stop(now + 0.34);

    const secondTone = context.createOscillator();
    const secondGain = context.createGain();
    secondTone.type = "triangle";
    secondTone.frequency.setValueAtTime(1174.66, now + 0.072);
    secondGain.gain.setValueAtTime(0.0001, now);
    secondGain.gain.setValueAtTime(0.42, now + 0.072);
    secondGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.43);
    secondTone.connect(secondGain).connect(chimeGain);
    secondTone.start(now + 0.072);
    secondTone.stop(now + 0.44);

    secondTone.addEventListener("ended", () => {
      firstTone.disconnect();
      secondTone.disconnect();
      secondGain.disconnect();
      chimeGain.disconnect();
    });
  }, [audioMuted, audioStarted, ensureAudioGraph]);

  return {
    ambientAudioRef,
    audioMuted,
    audioNeedsGesture,
    audioStarted,
    playNotificationChime,
    restoreAudioState,
    resumeAmbientAudio,
    startSoundscape,
    toggleAmbientAudio,
  };
}
