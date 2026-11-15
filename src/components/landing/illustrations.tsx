"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";

const cubes = {
  star: { src: "/assets/cubes/cube-star-amber.svg", tone: "gold" },
  spark: { src: "/assets/cubes/cube-spark-ink.svg", tone: "ink" },
  check: { src: "/assets/cubes/cube-check-emerald.svg", tone: "mint" },
  pin: { src: "/assets/cubes/cube-pin-white.svg", tone: "paper" },
  lock: { src: "/assets/cubes/cube-lock-ink.svg", tone: "ink" },
} as const;

type CubeVariant = keyof typeof cubes;

const stages = [
  { title: "Review arrives", variant: "star" as const },
  { title: "Pulse drafts", variant: "spark" as const },
  { title: "You refine", variant: "check" as const },
  { title: "You decide", variant: "pin" as const },
];

export function CubeMark({
  className = "",
  variant,
  floatDelay = 0,
  floatDuration = 4.8,
}: {
  className?: string;
  variant: CubeVariant;
  floatDelay?: number;
  floatDuration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });
  const reducedMotion = useReducedMotion();
  const shouldFloat = inView && !reducedMotion;
  const cube = cubes[variant];

  return (
    <motion.div
      ref={ref}
      className={`cube-mark cube-${cube.tone} ${className}`}
      aria-hidden="true"
      initial={false}
      animate={shouldFloat ? { y: [0, -7, 0] } : { y: 0 }}
      transition={
        shouldFloat
          ? {
              duration: floatDuration,
              delay: floatDelay,
              ease: "easeInOut",
              repeat: Infinity,
            }
          : { duration: 0.2 }
      }
    >
      <Image src={cube.src} alt="" width={130} height={150} />
    </motion.div>
  );
}

export function WorkflowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useReducedMotion();
  const shouldAnimate = inView && !reducedMotion;

  return (
    <section
      id="workflow"
      className="workflow-section page-width"
      aria-label="Review reply workflow"
    >
      <div ref={ref} className="workflow-connector" aria-hidden="true">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M150 50 L385 78 L615 24 L850 57" />
        </svg>
        <motion.span
          className="workflow-runner"
          style={{ left: "22%", top: "58%" }}
          animate={
            shouldAnimate
              ? {
                  left: ["22%", "38.5%", "61.5%", "82%"],
                  top: ["58%", "78%", "24%", "53%"],
                }
              : { left: "22%", top: "58%" }
          }
          transition={
            shouldAnimate
              ? {
                  duration: 5.5,
                  ease: "linear",
                  times: [0, 0.29, 0.71, 1],
                  repeat: Infinity,
                  repeatType: "loop",
                }
              : { duration: 0 }
          }
        />
      </div>
      <ol className="workflow-stages">
        {stages.map((stage, index) => (
          <li key={stage.title}>
            <CubeMark
              variant={stage.variant}
              floatDelay={index * 0.18}
              floatDuration={4.5 + index * 0.25}
            />
            <span className="workflow-step">{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.title}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
