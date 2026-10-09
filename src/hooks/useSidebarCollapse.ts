"use client";

import { useSyncExternalStore } from "react";

let globalIsCollapsed = false;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return globalIsCollapsed;
}

function getServerSnapshot() {
  return false;
}

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("simgizi_sidebar_collapsed");
  if (saved !== null) {
    globalIsCollapsed = saved === "true";
  }
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleCollapse = () => {
    globalIsCollapsed = !globalIsCollapsed;
    if (typeof window !== "undefined") {
      localStorage.setItem("simgizi_sidebar_collapsed", String(globalIsCollapsed));
    }
    listeners.forEach((l) => l());
  };

  return { isCollapsed, toggleCollapse };
}

export default useSidebarCollapse;
