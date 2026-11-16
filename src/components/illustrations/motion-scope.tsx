"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

export function MotionScope({ children, className }: { children: React.ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return <div ref={ref} className={className} data-motion-visible={inView}>{children}</div>;
}
