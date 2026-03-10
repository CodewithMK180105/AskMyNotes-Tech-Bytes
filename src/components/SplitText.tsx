"use client";

import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words" | "lines";
  from?: any;
  to?: any;
};

export default function SplitText({
  text,
  className = "",
  delay = 40,
  duration = 1,
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 }
}: Props) {
  return (
    <span className={`inline-block ${className}`}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={from}
          animate={to}
          transition={{
            duration,
            delay: index * delay / 1000
          }}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}