"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, BrainCircuit, FileText, CheckCircle, GraduationCap, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { GradientButton } from "@/components/shared/GradientButton";
import { AnimatedMeshBackground } from "@/components/shared/AnimatedMeshBackground";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GridScan } from '@/components/GridScan';
import SplitText from '@/components/SplitText';
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Subject-Scoped Context",
    description:
      "Upload your PDFs and TXT files. The AI only answers based on the material in that specific subject, avoiding hallucinations."
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Evidence-Backed Answers",
    description:
      "Every answer comes with confidence scores and exact citations pointing you to the page and snippet in your notes."
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "Interactive Study Mode",
    description:
      "Auto-generate Multiple Choice and Short Answer questions from your study materials to test your knowledge."
  }
];

export default function LandingPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

      {/* GridScan — dark mode only */}
      {isDark && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100vh', zIndex: 0, pointerEvents: 'none' }}
          className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]
                      [-webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        >
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#75c7bf"
            gridScale={0.1}
            scanColor="#FF9FFC"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.3}
            chromaticAberration={0.001}
            noiseIntensity={0.01}
          />
        </div>
      )}

      {!isDark && (
        <div
          style={{ height: '100vh', zIndex: 0, pointerEvents: 'none' }}
          className={cn(
            "absolute inset-0",
            "[background-size:80px_80px]",
            "[background-image:linear-gradient(to_right,#e4e4e7_3px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_3px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
            "[mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]",
            "[-webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          )}
        />
      )

      }

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-8 pt-12 md:px-16 max-w-[1400px] mx-auto">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/25 transition-all">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-heading font-bold text-xl md:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500">
            AskMyNotes
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-flex text-sm font-medium hover:text-indigo-500 transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <GradientButton className="h-10 px-4 rounded-xl text-sm md:text-base">
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
          className="text-center max-w-4xl mx-auto mt-24 md:mt-32"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6 leading-tight"
          >
            Your Ultimate{" "}
            <SplitText
              text="Study Copilot"
              className="inline bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
              delay={40}
              duration={1}
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
            />
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
        <div className="container mx-auto px-4 mt-32">
          <h2 className="text-3xl font-bold text-center">Key Features</h2>
          <HoverEffect items={features} />
        </div>
      </main>
    </div>
  );
}