"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

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
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
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
