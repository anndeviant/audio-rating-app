import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    User,
    ChevronRight,
    LogOut,
    Headphones,
    CheckCircle2,
} from "lucide-react";
import { getRatingsByRater, getAudioFiles, getPeserta } from "@/lib/supabase";

export default function ParticipantListPage() {
    const navigate = useNavigate();
    const [raterName, setRaterName] = useState("");
    const [raterId, setRaterId] = useState("");
    const [participants, setParticipants] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const name = localStorage.getItem("raterName");
        const id = localStorage.getItem("raterId");
        if (!name || !id) {
            navigate("/");
            return;
        }
        setRaterName(name);
        setRaterId(id);
        loadData(id);
    }, [navigate]);

    const loadData = async (id) => {
        try {
            const [pesertaList, ratings] = await Promise.all([
                getPeserta(),
                getRatingsByRater(id),
            ]);

            setParticipants(pesertaList);

            const progress = {};
            for (const p of pesertaList) {
                const audioFiles = await getAudioFiles(p.folder_name);
                const totalAudios = audioFiles.length;
                const ratedCount = ratings.filter(
                    (r) => r.peserta_id === p.id
                ).length;

                progress[p.id] = {
                    rated: ratedCount,
                    total: totalAudios,
                    percentage: totalAudios > 0 ? (ratedCount / totalAudios) * 100 : 0,
                };
            }

            setProgressData(progress);
        } catch (err) {
            console.error("Failed to load progress:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("raterName");
        localStorage.removeItem("raterId");
        navigate("/");
    };

    const totalRated = Object.values(progressData).reduce(
        (sum, p) => sum + p.rated,
        0
    );
    const totalAudios = Object.values(progressData).reduce(
        (sum, p) => sum + p.total,
        0
    );
    const overallProgress =
        totalAudios > 0 ? (totalRated / totalAudios) * 100 : 0;

    return (
        <div className="min-h-screen bg-background">
            {/* Top App Bar - Google style */}
            <header className="sticky top-0 z-50 bg-background border-b border-border">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Headphones className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-base font-medium text-foreground">
                            Audio Rating
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                            {raterName}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-normal text-foreground">
                        Halo, {raterName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pilih peserta untuk mulai menilai audio
                    </p>
                </div>

                {/* Overall Progress Card */}
                {!loading && (
                    <Card className="mb-6 shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-foreground">
                                    Progress Keseluruhan
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {totalRated}/{totalAudios} audio dinilai
                                </span>
                            </div>
                            <Progress value={overallProgress} />
                        </CardContent>
                    </Card>
                )}

                {/* Participants List */}
                <div className="space-y-3">
                    {participants.map((participant) => {
                        const progress = progressData[participant.id];
                        const isComplete =
                            progress && progress.total > 0 && progress.rated >= progress.total;

                        return (
                            <Link
                                key={participant.id}
                                to={`/participants/${participant.id}`}
                                className="block"
                            >
                                <Card
                                    className={`shadow-sm hover:shadow-md transition-all cursor-pointer border ${isComplete
                                        ? "border-green-200 bg-green-50/50"
                                        : "border-border hover:border-primary/30"
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isComplete
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-primary/10 text-primary"
                                                    }`}
                                            >
                                                {isComplete ? (
                                                    <CheckCircle2 className="w-6 h-6" />
                                                ) : (
                                                    <User className="w-6 h-6" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-medium text-foreground">
                                                    {participant.name}
                                                </h3>
                                                {loading ? (
                                                    <div className="h-4 bg-secondary rounded w-24 animate-pulse mt-1" />
                                                ) : progress ? (
                                                    <div className="mt-1.5">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs text-muted-foreground">
                                                                {progress.rated}/{progress.total} audio dinilai
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {Math.round(progress.percentage)}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={progress.percentage}
                                                            className="h-1.5"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Belum ada penilaian
                                                    </p>
                                                )}
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
