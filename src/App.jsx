import { useSyncExternalStore } from "react";
import Home from "./pages/Home";
import Fitness from "./pages/Fitness";

// Tiny location subscription so we re-render on pushState / popstate
function subscribeLocation(callback) {
  const handler = () => callback();
  window.addEventListener("popstate", handler);
  window.addEventListener("pushstate", handler);
  window.addEventListener("replacestate", handler);
  return () => {
    window.removeEventListener("popstate", handler);
    window.removeEventListener("pushstate", handler);
    window.removeEventListener("replacestate", handler);
  };
}

function getPath() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

export default function App() {
  const path = useSyncExternalStore(subscribeLocation, getPath, () => "/");

  if (path === "/fitness" || path.startsWith("/fitness/")) {
    return <Fitness />;
  }
  return <Home />;
}
