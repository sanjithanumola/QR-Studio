import React from 'react';
import {
  Clock,
  Trash2,
  Edit2,
  FolderOpen,
  Download,
  ShieldCheck,
  AlertCircle,
  Check,
  X,
  FileCode,
} from 'lucide-react';
import { SavedDesign } from '../types/qr';
import { generateMatrix, generateQrSvg, renderQrToCanvas } from '../utils/qrRenderer';

interface HistorySectionProps {
  designs: SavedDesign[];
  onLoadDesign: (design: SavedDesign) => void;
  onDeleteDesign: (id: string) => void;
  onClearAll: () => void;
  onRenameDesign: (id: string, newName: string) => void;
  onShowToast: (message: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  designs,
  onLoadDesign,
  onDeleteDesign,
  onClearAll,
  onRenameDesign,
  onShowToast,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editNameText, setEditNameText] = React.useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = React.useState<boolean>(false);

  const startRename = (design: SavedDesign) => {
    setEditingId(design.id);
    setEditNameText(design.name);
  };

  const saveRename = (id: string) => {
    if (editNameText.trim()) {
      onRenameDesign(id, editNameText.trim());
      onShowToast('Design renamed');
    }
    setEditingId(null);
  };

  const handleDownloadDirect = async (design: SavedDesign, format: 'png' | 'svg') => {
    try {
      const matrix = generateMatrix(design.payload, design.options.errorCorrectionLevel);

      if (format === 'svg') {
        const svg = generateQrSvg(matrix, design.options);
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        onShowToast(`Downloaded ${design.name} (SVG)`);
      } else {
        const canvas = document.createElement('canvas');
        await renderQrToCanvas(canvas, matrix, design.options, 1024);
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-1024px.png`;
        link.href = dataUrl;
        link.click();
        onShowToast(`Downloaded ${design.name} (PNG)`);
      }
    } catch {
      onShowToast('Download failed');
    }
  };

  return (
    <section id="recent-designs" className="space-y-6 scroll-mt-24">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Recent QR Designs</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {designs.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally saved presets and QR assets. Reload anytime for editing or downloading.
          </p>
        </div>

        {designs.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Clear All Saved Designs?</h3>
            </div>
            <p className="text-xs text-slate-400">
              This will permanently remove all {designs.length} locally saved QR codes from this browser. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClear(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                  onShowToast('Cleared all saved designs');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg cursor-pointer"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {designs.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center bg-slate-900/40 space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No saved designs yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Customize a QR code above and tap "Save Design" to store it here for future re-editing and exports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((design) => (
            <div
              key={design.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group shadow-sm"
            >
              <div>
                {/* Header row with thumbnail & title */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={design.thumbnail}
                      alt={design.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === design.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameText}
                          onChange={(e) => setEditNameText(e.target.value)}
                          className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white w-full focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(design.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveRename(design.id)}
                          className="p-1 text-emerald-400 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {design.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => startRename(design)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity cursor-pointer"
                          title="Rename design"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="uppercase text-[10px] font-semibold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/60">
                        {design.type}
                      </span>
                      <span>·</span>
                      <span>
                        {new Date(design.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payload snippet */}
                <div className="mt-3 p-2 bg-slate-950/70 border border-slate-800/80 rounded-lg text-[11px] font-mono text-slate-400 truncate">
                  {design.isSensitive ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Sensitive payload (masked in history)
                    </span>
                  ) : (
                    design.payload
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLoadDesign(design);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onShowToast(`Loaded ${design.name}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Open & Edit</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadDirect(design, 'png')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Download PNG (1024px)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDirect(design, 'svg')}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Download SVG vector"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteDesign(design.id);
                      onShowToast(`Removed ${design.name}`);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Delete design"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
