"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
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

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
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
        } catch (err: unknown) {
            const errorMessage = getFirebaseErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update the user's display name
            await updateProfile(userCredential.user, { displayName });
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = getFirebaseErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            router.push("/login");
        } catch (err: unknown) {
            const errorMessage = getFirebaseErrorMessage(err);
            setError(errorMessage);
        }
    };

    const signInWithGoogle = async () => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push("/dashboard");
        } catch (err: unknown) {
            const errorMessage = getFirebaseErrorMessage(err);
            setError(errorMessage);
            throw new Error(errorMessage);
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

// Helper: Convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(error: unknown): string {
    if (error && typeof error === "object" && "code" in error) {
        const code = (error as { code: string }).code;
        switch (code) {
            case "auth/email-already-in-use":
                return "This email is already registered. Try signing in instead.";
            case "auth/invalid-email":
                return "Please enter a valid email address.";
            case "auth/operation-not-allowed":
                return "Email/password accounts are not enabled. Contact support.";
            case "auth/weak-password":
                return "Password is too weak. Use at least 6 characters.";
            case "auth/user-disabled":
                return "This account has been disabled. Contact support.";
            case "auth/user-not-found":
                return "No account found with this email. Please register first.";
            case "auth/wrong-password":
                return "Incorrect password. Please try again.";
            case "auth/invalid-credential":
                return "Invalid email or password. Please check your credentials.";
            case "auth/too-many-requests":
                return "Too many failed attempts. Please try again later.";
            default:
                return "An authentication error occurred. Please try again.";
        }
    }
    return "An unexpected error occurred. Please try again.";
}
