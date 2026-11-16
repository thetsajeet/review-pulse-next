"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutDashboard, MapPin, MessageSquare, PanelLeft, Search, Settings } from "lucide-react";
import { BrandMark } from "@/components/illustrations/brand-mark";

const SearchContext = createContext<{ query: string; setQuery: (value: string) => void } | null>(null);

function subscribeToNarrowScreen(callback: () => void) {
  const media = window.matchMedia("(max-width: 800px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function isNarrowScreen() {
  return window.matchMedia("(max-width: 800px)").matches;
}

function serverScreenSnapshot() {
  return false;
}

export function useWorkspaceSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("Workspace search requires a workspace shell.");
  return context;
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const [sidebarPreference, setSidebarPreference] = useState<boolean | null>(null);
  const narrowScreen = useSyncExternalStore(subscribeToNarrowScreen, isNarrowScreen, serverScreenSnapshot);
  const collapsed = sidebarPreference ?? narrowScreen;
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const isReviews = pathname.startsWith("/command-center");

  function closeMobileNavigation() {
    if (narrowScreen) setSidebarPreference(true);
  }

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <div className={`workspace-shell${collapsed ? " workspace-shell-collapsed" : ""}`}>
        <aside className="shared-sidebar" id="workspace-navigation" aria-label="Primary navigation">
          {!collapsed && <button type="button" className="sidebar-mobile-close" aria-label="Collapse sidebar" onClick={() => setSidebarPreference(true)}><PanelLeft /></button>}
          <Link className="shared-brand" href="/" aria-label="Review Pulse home">
            <BrandMark />
            <span className="shared-sidebar-copy"><strong>Review Pulse</strong><small>Workspace</small></span>
          </Link>
          <span className="shared-nav-label">Menu</span>
          <nav className="shared-nav">
            <Link className={`shared-nav-link${!isReviews ? " active" : ""}`} href="/dashboard" aria-label="Dashboard" aria-current={!isReviews ? "page" : undefined} title="Dashboard" onClick={closeMobileNavigation}><LayoutDashboard /><span>Dashboard</span></Link>
            <Link className={`shared-nav-link${isReviews ? " active" : ""}`} href="/command-center" aria-label="Reviews" aria-current={isReviews ? "page" : undefined} title="Reviews" onClick={closeMobileNavigation}><MessageSquare /><span>Reviews</span></Link>
            <span className="shared-nav-link unavailable" aria-disabled="true" title="Locations, coming soon"><MapPin /><span>Locations</span><small>Soon</small></span>
          </nav>
          <span className="shared-nav-label">Workspace</span>
          <nav className="shared-nav">
            <span className="shared-nav-link unavailable" aria-disabled="true" title="Settings, coming soon"><Settings /><span>Settings</span><small>Soon</small></span>
          </nav>
        </aside>
        <div className="shared-main">
          <header className="shared-topbar">
            <div className="shared-page-title">
              <button type="button" className="sidebar-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="workspace-navigation" onClick={() => setSidebarPreference(!collapsed)}><PanelLeft /></button>
              {isReviews ? <Inbox aria-hidden="true" /> : <LayoutDashboard aria-hidden="true" />}
              <strong>{isReviews ? "Reviews" : "Dashboard"}</strong>
              {isReviews && <><span aria-hidden="true">/</span><span>Inbox</span></>}
            </div>
            {isReviews ? (
              <label className="shared-search"><Search aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reviews" aria-label="Search reviews" /></label>
            ) : (
              <Link className="shared-search" href="/command-center"><Search aria-hidden="true" />Search reviews</Link>
            )}
          </header>
          {children}
        </div>
      </div>
    </SearchContext.Provider>
  );
}
