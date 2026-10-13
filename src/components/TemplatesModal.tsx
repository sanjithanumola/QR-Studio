import React from 'react';
import {
  X,
  Globe,
  UserCheck,
  Wifi,
  Share2,
  Mail,
  Calendar,
  Utensils,
  Package,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { QR_TEMPLATES } from '../data/templates';
import { TemplateItem } from '../types/qr';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateItem) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Globe,
  UserCheck,
  Wifi,
  Share2,
  Mail,
  Calendar,
  Utensils,
  Package,
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  if (!isOpen) return null;

  const categories = ['all', 'Web & Link', 'Identity', 'Network', 'Social', 'Contact', 'Events', 'Hospitality', 'Packaging'];

  const filtered = selectedCategory === 'all'
    ? QR_TEMPLATES
    : QR_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">QR Code Templates</h3>
              <p className="text-xs text-slate-400">
                Quick-start presets with formatted payloads and tailored styling. All sample values can be modified.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'all' ? 'All Templates' : cat}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((tpl) => {
            const Icon = iconMap[tpl.icon] || Globe;
            return (
              <div
                key={tpl.id}
                className="p-4 bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800 hover:border-indigo-500/60 rounded-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-950/50 border border-amber-800/60 px-2 py-0.5 rounded">
                      {tpl.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {tpl.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Type: <span className="uppercase text-slate-300">{tpl.type}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
