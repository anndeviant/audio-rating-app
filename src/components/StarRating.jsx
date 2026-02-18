import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

export function StarRating({ value = 0, onChange, disabled = false }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hovered || value);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "p-0.5 transition-all duration-150 rounded-full hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                            disabled && "cursor-not-allowed opacity-60"
                        )}
                        onMouseEnter={() => !disabled && setHovered(star)}
                        onMouseLeave={() => !disabled && setHovered(0)}
                        onClick={() => !disabled && onChange?.(star)}
                        aria-label={`Rate ${star} out of 5`}
                    >
                        <Star
                            className={cn(
                                "w-7 h-7 transition-colors duration-150",
                                isActive
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-transparent text-gray-300"
                            )}
                        />
                    </button>
                );
            })}
            {value > 0 && (
                <span className="ml-2 text-sm text-muted-foreground font-medium">
                    {value}/5
                </span>
            )}
        </div>
    );
}
