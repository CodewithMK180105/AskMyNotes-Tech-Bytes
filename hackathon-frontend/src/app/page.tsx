"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, BrainCircuit, FileText, CheckCircle, GraduationCap, Sparkles } from "lucide-react";
import { GradientButton } from "@/components/shared/GradientButton";
import { AnimatedMeshBackground } from "@/components/shared/AnimatedMeshBackground";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const features = [
  {
    icon: FileText,
    title: "Subject-Scoped Context",
    description: "Upload your PDFs and TXT files. The AI only answers based on the material in that specific subject, avoiding hallucinations.",
  },
  {
    icon: Sparkles,
    title: "Evidence-Backed Answers",
    description: "Every answer comes with confidence scores and exact citations pointing you to the page and snippet in your notes.",
  },
  {
    icon: BrainCircuit,
    title: "Interactive Study Mode",
    description: "Auto-generate Multiple Choice and Short Answer questions from your study materials to test your knowledge.",
  },
];

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedMeshBackground />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500">
            AskMyNotes
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-flex text-sm font-medium hover:text-indigo-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <GradientButton className="h-10 px-4 rounded-xl">
              Get Started
            </GradientButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-medium border border-white/10 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hackathon Project Alpha
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6 leading-tight"
          >
            Your Ultimate{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500">
              Study Copilot
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upload your notes, ask questions, and test your knowledge. The AI limits its context strictly to your uploads.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <GradientButton className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Try AskMyNotes Now
              </GradientButton>
            </Link>
          </motion.div>

          {/* Social Proof Placeholder */}
          <motion.div variants={itemVariants} className="mt-16 flex items-center justify-center gap-6 text-sm text-muted-foreground opacity-80">
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Evidence-Based</div>
            <div className="hidden sm:flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Subject-Scoped</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> Interactive Study</div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 + 0.2 }}
                className="glassmorphism p-8 rounded-3xl relative overflow-hidden group border border-white/5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 text-indigo-500 flex items-center justify-center mb-6 border border-indigo-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  );
}
