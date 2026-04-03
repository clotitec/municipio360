"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

export default function GlassCard({ children, className = "", onClick, animate = true }: GlassCardProps) {
  const Wrapper = animate ? motion.div : "div";
  const props = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Wrapper
      className={`backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-lg ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Wrapper>
  );
}
