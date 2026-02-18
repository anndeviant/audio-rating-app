import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Headphones, Loader2 } from "lucide-react";
import { getOrCreateRater } from "@/lib/supabase";

export default function LandingPage() {
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Silakan masukkan nama Anda");
            return;
        }
        if (trimmed.length < 2) {
            setError("Nama minimal 2 karakter");
            return;
        }

        setIsSubmitting(true);
        try {
            const rater = await getOrCreateRater(trimmed);
            localStorage.setItem("raterId", rater.id);
            localStorage.setItem("raterName", rater.name);
            navigate("/participants");
        } catch (err) {
            setError("Gagal menyimpan data. Silakan coba lagi.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            {/* Google-style centered layout */}
            <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Logo / Icon */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Headphones className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-normal text-foreground">
                            Audio Rating System
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Sistem penilaian kemiripan audio untuk penelitian
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="w-full shadow-md border-border">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Nama Penilai
                                </label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Masukkan nama lengkap Anda"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError("");
                                    }}
                                    autoFocus
                                    className={error ? "border-destructive" : ""}
                                />
                                {error && (
                                    <p className="text-sm text-destructive">{error}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Mulai Penilaian"
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-muted-foreground text-center leading-relaxed">
                                Anda akan menilai kemiripan audio dari 5 peserta. Setiap audio
                                dinilai dengan skala 1–5. Data Anda akan digunakan untuk
                                keperluan penelitian.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
