import { Suspense } from "react";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import "@/app/dashboard/dashboard.css";
import "@/app/command-center/command-center.css";
import "./workspace.css";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div role="status">Loading workspace...</div>}><WorkspaceShell>{children}</WorkspaceShell></Suspense>;
}
