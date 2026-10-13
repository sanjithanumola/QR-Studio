import React from 'react';
import { X, BookmarkPlus, ShieldCheck } from 'lucide-react';
import { ContentType } from '../types/qr';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  defaultName: string;
  onConfirmSave: (name: string, isSensitive: boolean) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  contentType,
  defaultName,
  onConfirmSave,
}) => {
  const [name, setName] = React.useState<string>(defaultName);
  const [isSensitive, setIsSensitive] = React.useState<boolean>(contentType === 'wifi');

  React.useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setIsSensitive(contentType === 'wifi');
    }
  }, [isOpen, defaultName, contentType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirmSave(name.trim(), isSensitive);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Save QR Design</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="design-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Design Name
            </label>
            <input
              id="design-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Guest Wi-Fi Card"
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Sensitive Design Protection
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Save visual styling and layout without storing plain-text passwords or private credentials in browser history.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm cursor-pointer"
            >
              Save Design
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
