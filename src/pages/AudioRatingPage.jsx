import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AudioPlayer } from "@/components/AudioPlayer";
import { StarRating } from "@/components/StarRating";
import {
    ArrowLeft,
    Headphones,
    Loader2,
    CheckCircle2,
    Music,
} from "lucide-react";
import {
    getAudioFiles,
    saveRating,
    getRatingsByRaterAndPeserta,
    getPeserta,
} from "@/lib/supabase";

export default function AudioRatingPage() {
    const { participantId } = useParams();
    const navigate = useNavigate();
    const pesertaId = parseInt(participantId, 10);

    const [raterId, setRaterId] = useState("");
    const [peserta, setPeserta] = useState(null);
    const [audioFiles, setAudioFiles] = useState([]);
    const [ratings, setRatings] = useState({});
    const [savingStates, setSavingStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const name = localStorage.getItem("raterName");
        const id = localStorage.getItem("raterId");
        if (!name || !id) {
            navigate("/");
            return;
        }
        setRaterId(id);
        loadData(id);
    }, [navigate, pesertaId]);

    const loadData = async (id) => {
        try {
            setLoading(true);

            // Fetch peserta info to get folder_name
            const pesertaList = await getPeserta();
            const currentPeserta = pesertaList.find((p) => p.id === pesertaId);

            if (!currentPeserta) {
                console.error("Peserta not found");
                navigate("/participants");
                return;
            }

            setPeserta(currentPeserta);

            const [files, existingRatings] = await Promise.all([
                getAudioFiles(currentPeserta.folder_name),
                getRatingsByRaterAndPeserta(id, pesertaId),
            ]);

            setAudioFiles(files);

            const ratingsMap = {};
            existingRatings.forEach((r) => {
                ratingsMap[r.audio_filename] = r.rating;
            });
            setRatings(ratingsMap);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRate = useCallback(
        async (audioFilename, rating) => {
            setSavingStates((prev) => ({ ...prev, [audioFilename]: true }));

            try {
                await saveRating({
                    raterId,
                    pesertaId,
                    audioFilename,
                    rating,
                });

                setRatings((prev) => ({ ...prev, [audioFilename]: rating }));

                // Show brief success feedback
                setSuccessMessage(audioFilename);
                setTimeout(() => setSuccessMessage(""), 1500);
            } catch (err) {
                console.error("Failed to save rating:", err);
            } finally {
                setSavingStates((prev) => ({ ...prev, [audioFilename]: false }));
            }
        },
        [raterId, pesertaId]
    );

    const ratedCount = Object.keys(ratings).length;
    const totalCount = audioFiles.length;
    const progressPercent = totalCount > 0 ? (ratedCount / totalCount) * 100 : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Memuat audio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top App Bar */}
            <header className="sticky top-0 z-50 bg-background border-b border-border">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
                    <Link
                        to="/participants"
                        className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground" />
                    </Link>
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Headphones className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-base font-medium text-foreground">
                                {peserta?.name || `Peserta ${pesertaId}`}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {ratedCount}/{totalCount} audio dinilai
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Progress Section */}
                <Card className="mb-6 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-foreground">
                                Progress Penilaian
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                        <Progress value={progressPercent} />
                        {progressPercent === 100 && (
                            <div className="flex items-center gap-2 mt-3 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Semua audio sudah dinilai!
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Audio List */}
                {audioFiles.length === 0 ? (
                    <div className="text-center py-12">
                        <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                            Tidak ada file audio untuk peserta ini
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {audioFiles.map((audio, index) => {
                            const currentRating = ratings[audio.name] || 0;
                            const isSaving = savingStates[audio.name];
                            const justSaved = successMessage === audio.name;

                            return (
                                <Card
                                    key={audio.name}
                                    className={`shadow-sm transition-all ${currentRating > 0
                                        ? "border-green-200 bg-green-50/30"
                                        : "border-border"
                                        } ${justSaved ? "ring-2 ring-green-300" : ""}`}
                                >
                                    <CardContent className="p-5">
                                        {/* Audio number and status */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                                    Audio {index + 1}
                                                </span>
                                                {currentRating > 0 && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                            {isSaving && (
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            )}
                                            {justSaved && !isSaving && (
                                                <span className="text-xs text-green-600 font-medium">
                                                    Tersimpan!
                                                </span>
                                            )}
                                        </div>

                                        {/* Audio Player */}
                                        <div className="mb-4">
                                            <AudioPlayer src={audio.url} />
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Nilai kemiripan:
                                            </span>
                                            <StarRating
                                                value={currentRating}
                                                onChange={(val) => handleRate(audio.name, val)}
                                                disabled={isSaving}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Bottom navigation */}
                <div className="mt-8 pb-8 flex justify-center">
                    <Button variant="outline" asChild>
                        <Link to="/participants">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar Peserta
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}
