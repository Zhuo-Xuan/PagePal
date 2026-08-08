import { useState, useEffect, useRef } from "react";

const AMBIENT_AUDIO = {
  rain: "/sounds/rain.mp3",
  forest: "/sounds/forest.mp3",
  cafe: "/sounds/drink.mp3",
  silence: null,
};

export function useAmbientSound(ambientId) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
      setIsPlaying(false);
    }

    if (ambientId === "silence") return;

    const url = AMBIENT_AUDIO[ambientId];
    if (!url) return;

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    audio.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [ambientId]);


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const resume = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return { isPlaying, resume, volume, setVolume };
}
