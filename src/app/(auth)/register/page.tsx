"use client";

import { useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { GradientButton } from "@/components/shared/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
    const { signUp, signInWithGoogle } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const getPasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length > 7) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[a-z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        return strength;
    };

    const strength = getPasswordStrength(formData.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            await signUp(formData.email, formData.password, formData.name);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError("");
        try {
            await signInWithGoogle();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
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

                    {/* Google Sign-Up Button */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-background/50 hover:bg-secondary/50 transition-all duration-200 text-sm font-medium mb-6 disabled:opacity-60 disabled:cursor-not-allowed group/google"
                    >
                        {isGoogleLoading ? (
                            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        <span className="group-hover/google:text-foreground transition-colors">
                            {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
                        </span>
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-card text-muted-foreground">or register with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    className="pl-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    className="pl-9 pr-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="pt-1">
                                    <Progress value={strength} className="h-1.5" />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">
                                        {strength < 50 ? "Weak" : strength < 75 ? "Medium" : "Strong"}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    className="pl-9 bg-background/50 border-white/10 focus-visible:ring-indigo-500 rounded-xl"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <GradientButton
                            type="submit"
                            className="w-full mt-2"
                            isLoading={isLoading}
                            disabled={
                                isGoogleLoading ||
                                !formData.name ||
                                !formData.email ||
                                !formData.password ||
                                formData.password !== formData.confirmPassword
                            }
                        >
                            Create Account
                        </GradientButton>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
