"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/shared/PageTransition";
import { GradientButton } from "@/components/shared/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, User, File, UploadCloud, X, PlusCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Subject Tracking State
    const [subjects, setSubjects] = useState([{ name: "", file: null as File | null }]);
    const [error, setError] = useState("");

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 7) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[a-z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        return strength;
    };

    const handleSubjectChange = (index: number, value: string) => {
        const newSubjects = [...subjects];
        newSubjects[index].name = value;
        setSubjects(newSubjects);
        setError(""); // Clear error on change
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newSubjects = [...subjects];
            newSubjects[index].file = e.target.files[0];
            setSubjects(newSubjects);
            setError("");
        }
    };

    const handleAddSubject = () => {
        if (subjects.length < 3) {
            setSubjects([...subjects, { name: "", file: null }]);
        }
    };

    const handleRemoveSubject = (index: number) => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const strength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (subjects.length !== 3) {
            setError("You must register exactly 3 subjects.");
            return;
        }

        const missingNames = subjects.some(s => !s.name.trim());
        const missingFiles = subjects.some(s => !s.file);

        if (missingNames || missingFiles) {
            setError("Every subject must have a name and exactly 1 uploaded PDF.");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            router.push("/dashboard");
        }, 1500);
    };

    return (
        <PageTransition className="w-full">
            <div className="glassmorphism-card w-full p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-semibold font-heading mb-2">
                            Create an account
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Register now to unlock AskMyNotes features.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
                            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        className="pl-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="pl-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        className="pl-9 pr-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {formData.password && (
                                    <div className="pt-2">
                                        <Progress
                                            value={strength}
                                            className="h-1.5"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1 text-right">
                                            {strength < 50
                                                ? "Weak"
                                                : strength < 75
                                                    ? "Medium"
                                                    : "Strong"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        className="pl-9 pr-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                {formData.confirmPassword &&
                                    formData.password !== formData.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Passwords do not match
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Exact 3 Subjects Section */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-medium">Register Your Subjects (Exactly 3)</Label>
                                <button
                                    type="button"
                                    disabled={subjects.length >= 3}
                                    onClick={handleAddSubject}
                                    className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PlusCircle className="h-4 w-4" /> Add Subject
                                </button>
                            </div>

                            <div className="space-y-4">
                                {subjects.map((subject, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start bg-secondary/30 p-3 rounded-xl border border-white/5">
                                        <div className="flex-1 w-full space-y-2">
                                            <Input
                                                placeholder={`Subject ${index + 1} Name`}
                                                className="bg-background/50 border-white/10 rounded-lg h-10"
                                                value={subject.name}
                                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                            />
                                        </div>

                                        <div className="w-full sm:w-auto flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                className={cn(
                                                    "flex items-center justify-center h-10 px-3 rounded-lg border border-dashed transition-all",
                                                    subject.file ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" : "border-white/20 hover:bg-white/5 text-muted-foreground hover:text-foreground hover:border-indigo-500/50"
                                                )}
                                            >
                                                {subject.file ? (
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <File className="h-4 w-4" />
                                                        <span className="truncate max-w-[100px]">{subject.file.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <UploadCloud className="h-4 w-4" />
                                                        <span>Upload Note PDF</span>
                                                    </div>
                                                )}
                                            </button>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                ref={(el) => {
                                                    fileInputRefs.current[index] = el;
                                                }}
                                                onChange={(e) => handleFileChange(index, e)}
                                            />
                                            {subjects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubject(index)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                                    title="Remove Subject"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <GradientButton
                            type="submit"
                            className="w-full mt-6"
                            isLoading={isLoading}
                            disabled={
                                formData.password !== formData.confirmPassword ||
                                !formData.password ||
                                subjects.length !== 3
                            }
                        >
                            Complete Registration
                        </GradientButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
