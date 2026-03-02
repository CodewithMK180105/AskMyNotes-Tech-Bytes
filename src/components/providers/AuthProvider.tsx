"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
    User as FirebaseUser,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface User {
    id: string;
    email: string;
    displayName: string;
    isFirebase?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>; // Mock or remove Google sign-in
    signOut: () => Promise<void>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    // Check authentication (Firebase only now)
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
            if (fbUser) {
                setUser({
                    id: fbUser.uid,
                    email: fbUser.email || "",
                    displayName: fbUser.displayName || "",
                    isFirebase: true
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Route protection: redirect unauthenticated users away from protected routes
    useEffect(() => {
        if (!loading) {
            const isPublicRoute = PUBLIC_ROUTES.some(
                (route) => pathname === route || pathname.startsWith("/api")
            );

            if (!user && !isPublicRoute) {
                router.push("/login");
            }
        }
    }, [user, loading, pathname, router]);

    const clearError = () => setError(null);

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
            throw err;
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Set the display name for the new user
            if (userCredential.user) {
                await updateProfile(userCredential.user, {
                    displayName: displayName
                });
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign up");
            throw err;
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            setUser(null);
            router.push("/login");
        } catch (err: any) {
            setError("Failed to sign out");
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const fbUser = result.user;
            setUser({
                id: fbUser.uid,
                email: fbUser.email || "",
                displayName: fbUser.displayName || "",
                isFirebase: true
            });
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Google sign in failed");
            throw err;
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, error, clearError }}
        >
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
                    {/* Animated background elements for premium feel */}
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />

                    <div className="flex flex-col items-center gap-8 relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeOut"
                            }}
                            className="relative"
                        >
                            <motion.div
                                className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <div className="h-24 w-24 rounded-3xl bg-card border border-border shadow-2xl flex items-center justify-center relative z-10 p-4">
                                <motion.img
                                    src="/icon.svg"
                                    alt="AskMyNotes"
                                    className="w-full h-full"
                                />
                            </div>
                        </motion.div>

                        <div className="flex flex-col items-center gap-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="font-heading font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
                            >
                                AskMyNotes
                            </motion.h2>
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
