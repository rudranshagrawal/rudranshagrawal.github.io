export default function Footer() {
  return (
    <footer className="container-page py-10 border-t border-paper-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-ink-500">
        <div>© {new Date().getFullYear()} Rudransh Agrawal</div>
        <div className="font-mono text-xs">
          Built with React, Vite & Tailwind · Hosted on Netlify
        </div>
      </div>
    </footer>
  );
}
