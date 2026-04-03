"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import LanguageSelector from "@/components/ui/LanguageSelector";

interface AudioPlayerProps {
  audioUrls: Record<string, string>;
  languages: string[];
  currentLang: string;
  onLangChange: (lang: string) => void;
  onPlay?: () => void;
  onComplete?: () => void;
  onPause?: () => void;
  color?: string;
}

export default function AudioPlayer({
  audioUrls,
  languages,
  currentLang,
  onLangChange,
  onPlay,
  onComplete,
  onPause,
  color = "#1A5276",
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioUrl = audioUrls[currentLang] || audioUrls.es || Object.values(audioUrls)[0];
  const availableLangs = languages.filter((l) => audioUrls[l]);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      onPause?.();
    } else {
      audioRef.current.play();
      onPlay?.();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Audioguía</span>
        </div>
        {availableLangs.length > 1 && (
          <LanguageSelector
            languages={availableLangs}
            current={currentLang}
            onChange={onLangChange}
          />
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); onComplete?.(); }}
        preload="metadata"
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          style={{ backgroundColor: color }}
        >
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${(progress / (duration || 1)) * 100}%, #e5e7eb ${(progress / (duration || 1)) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
