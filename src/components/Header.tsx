import React from 'react';
import { QrCode, Sun, Moon, Sparkles, Printer } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenTemplates: () => void;
  onOpenPrint: () => void;
  onNewQr: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenTemplates,
  onOpenPrint,
  onNewQr,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors border-slate-800/80 bg-slate-950/80 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              QR Studio
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-1.5 py-0.5 rounded">
                Pro
              </span>
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#generator"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Studio
          </a>
          <button
            type="button"
            onClick={onOpenTemplates}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Templates
          </button>
          <a
            href="#recent-designs"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Saved Designs
          </a>
          <a
            href="#privacy-faq"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Privacy & Trust
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            type="button"
            onClick={onOpenPrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            Print Sheet
          </button>

          <button
            type="button"
            onClick={onNewQr}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            New QR Code
          </button>
        </div>
      </div>
    </header>
  );
};
