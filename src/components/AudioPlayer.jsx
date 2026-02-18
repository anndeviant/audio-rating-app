import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export function AudioPlayer({ src, title }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        audio.currentTime = percentage * duration;
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 w-full">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4" />
                ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                )}
            </button>

            {/* Progress bar and time */}
            <div className="flex-1 min-w-0">
                {title && (
                    <p className="text-sm font-medium text-foreground truncate mb-1">
                        {title}
                    </p>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                        {formatTime(currentTime)}
                    </span>
                    <div
                        className="flex-1 h-1.5 bg-secondary rounded-full cursor-pointer group relative"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-primary rounded-full transition-all relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-10 tabular-nums">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>

            {/* Volume */}
            <button
                onClick={toggleMute}
                className="flex-shrink-0 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground cursor-pointer focus:outline-none"
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
                {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                ) : (
                    <Volume2 className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
