"use client";

import { motion, useReducedMotion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MotionLinkProps = {
  children: React.ReactNode;
  href: string;
  size?: "small" | "default";
  variant?: "default" | "outline";
};

export function MotionLink({
  children,
  href,
  size = "default",
  variant = "default",
}: MotionLinkProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.a
      href={href}
      className={cn(buttonVariants({ variant }), "landing-button", {
        "landing-button-small": size === "small",
      })}
      whileHover={reducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.a>
  );
}
