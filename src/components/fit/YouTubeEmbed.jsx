import { useState } from "react";

/**
 * Lazy YouTube embed — renders a static thumbnail first (free, zero network
 * beyond the image), swaps in the iframe only on tap. Keeps the Workout tab
 * snappy with 7+ exercises and preserves mobile data.
 *
 * Ad-free when the user is logged into YouTube Premium on this browser.
 * Iframes inherit login state via cross-site cookies.
 */
export default function YouTubeEmbed({ videoId, title = "exercise demo" }) {
  const [loaded, setLoaded] = useState(false);

  if (!videoId) return null;

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  // autoplay=1 + playsinline=1 so tapping actually plays on iOS without kicking
  // into fullscreen. modestbranding + rel=0 clean up the player chrome.
  const embed = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`;

  if (loaded) {
    return (
      <div className="relative w-full aspect-video bg-bg-elev border border-line overflow-hidden">
        <iframe
          src={embed}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group relative w-full aspect-video bg-bg-elev border border-line overflow-hidden active:scale-[0.99] transition"
      aria-label={`play ${title}`}
    >
      <img
        src={thumb}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-active:opacity-100 transition"
        loading="lazy"
        onError={(e) => {
          // hqdefault is present for 99% of videos; fall back to default
          e.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/0.jpg`;
        }}
      />
      {/* Dark overlay for play button contrast */}
      <div className="absolute inset-0 bg-bg/30" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-amber text-bg flex items-center justify-center shadow-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
