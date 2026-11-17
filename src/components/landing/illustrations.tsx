"use client";

import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import { Cube, type CubeVariant } from "@/components/illustrations/cube";

const stages = [
  { title: "Review arrives", variant: "star" },
  { title: "Cubecca drafts", variant: "spark" },
  { title: "You refine", variant: "check" },
  { title: "You decide", variant: "pin" },
] as const;

const tones: Record<CubeVariant, string> = {
  star: "gold", spark: "ink", check: "mint", pin: "paper", lock: "ink",
};

const connectors = [
  { path: "M195 50 C267.5 50 267.5 62 340 62", start: [195, 50], end: [340, 62], delay: "1s" },
  { path: "M430 62 C500 62 500 39 570 39", start: [430, 62], end: [570, 39], delay: "3s" },
  { path: "M660 39 C732.5 39 732.5 53 805 53", start: [660, 39], end: [805, 53], delay: "5s" },
];

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CubeMark({
  className = "",
  variant,
  motion = "hop",
  delay = 0,
}: {
  className?: string;
  variant: CubeVariant;
  motion?: "hop" | "bounce" | "roll" | "none";
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className={`cube-mark cube-${tones[variant]} cube-motion-${motion} ${className}`} data-motion-visible={inView} style={{ "--cube-delay": `${delay}s` } as React.CSSProperties} aria-hidden="true">
      <Cube variant={variant} />
    </div>
  );
}

export function WorkflowDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => true);
  return (
    <section id="workflow" className="workflow-section page-width" aria-label="Review reply workflow">
      <div ref={ref} className="workflow-connector" data-motion-visible={inView} aria-hidden="true">
        <svg viewBox="0 0 1000 100">
          {connectors.map(({ path, start, end, delay }) => (
            <g key={path}>
              <path className="workflow-dash" d={path} />
              <circle cx={start[0]} cy={start[1]} r="4" fill="#fff" stroke="#18181b" strokeWidth="1.5" />
              <circle cx={end[0]} cy={end[1]} r="4" fill="#18181b" />
              {inView && !reducedMotion && (
                <circle r="7" fill="#10b981" stroke="#18181b" strokeWidth="1.5" opacity="0">
                  <animateMotion path={path} dur="8s" repeatCount="indefinite" begin={delay} keyPoints="0;1;1" keyTimes="0;.22;1" calcMode="linear" />
                  <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.02;.22;.25;1" dur="8s" repeatCount="indefinite" begin={delay} />
                </circle>
              )}
            </g>
          ))}
        </svg>
      </div>
      <ol className="workflow-stages">
        {stages.map((stage, index) => (
          <li key={stage.title}>
            <CubeMark variant={stage.variant} motion="bounce" delay={index * 2} />
            <span className="workflow-step">{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.title}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
