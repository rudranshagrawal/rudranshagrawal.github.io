export default function Footer() {
  return (
    <footer className="container-page py-10 border-t border-line">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-fg-muted">
        <div>
          <span className="text-amber">$</span> echo &quot;© {new Date().getFullYear()} rudransh agrawal&quot;
        </div>
        <div>
          built with react · vite · tailwind · netlify
        </div>
      </div>
    </footer>
  );
}
