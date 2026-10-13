import React from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle2, Cpu } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <section id="privacy-faq" className="mt-16 pt-12 border-t border-slate-800 scroll-mt-24 space-y-8">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>Security & Engineering Principles</span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Privacy-First Architecture & Scanning Reliability
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Everything generated in QR Studio runs 100% locally on your computer. Here is our transparent disclosure of how data and QR mechanics work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">100% Client-Side Generation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your Wi-Fi passwords, contact vCards, phone numbers, and URLs never leave your device. QR matrices are synthesized entirely inside your web browser’s memory.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">Browser Storage Only</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Designs are persisted only in your browser's private local storage. Sensitive Wi-Fi passwords can be excluded or cleared at any time with one click.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">QR Code Public Reality</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            QR codes are not encrypted storage. Anyone with a smartphone camera can read the encoded payload. Never encode bank PINs, private keys, or confidential secrets.
          </p>
        </div>
      </div>

      {/* FAQ Accordion / Grid */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-200">Will my QR code expire?</div>
            <p className="text-slate-400 leading-relaxed">
              No. QR Studio generates direct static QR codes. The encoded data lives directly in the barcode itself without third-party redirects or subscription trackers.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-200">Why does adding a logo require High (H) error correction?</div>
            <p className="text-slate-400 leading-relaxed">
              A center logo covers approximately 20% of the matrix. Reed-Solomon Level H restores up to 30% of occluded modules, ensuring instant camera decodability.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-200">Can I print the downloaded SVG in professional print shops?</div>
            <p className="text-slate-400 leading-relaxed">
              Yes. The SVG download contains pure vector coordinates that scale infinitely without pixelation, ideal for billboards, business cards, and packaging.
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-slate-200">What is the recommended quiet zone?</div>
            <p className="text-slate-400 leading-relaxed">
              ISO/IEC 18004 specifies a quiet zone of 4 modules. In practice, 2 to 4 modules work reliably on standard print paper and digital screens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
