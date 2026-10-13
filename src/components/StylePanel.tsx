import React from 'react';
import {
  Palette,
  Shapes,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { CornerStyle, ErrorCorrectionLevel, ModuleStyle, QrCustomization } from '../types/qr';
import { analyzeContrast } from '../utils/qrRenderer';
import { PRESET_LOGOS } from '../data/presetLogos';

interface StylePanelProps {
  customization: QrCustomization;
  setCustomization: React.Dispatch<React.SetStateAction<QrCustomization>>;
  onResetStyle: () => void;
}

const COLOR_PRESETS = [
  { name: 'Slate', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Midnight', fg: '#1e1b4b', bg: '#ffffff' },
  { name: 'Indigo', fg: '#4338ca', bg: '#ffffff' },
  { name: 'Cyan Blue', fg: '#0284c7', bg: '#ffffff' },
  { name: 'Emerald', fg: '#0f766e', bg: '#ffffff' },
  { name: 'Crimson', fg: '#991b1b', bg: '#ffffff' },
  { name: 'Pure Black', fg: '#000000', bg: '#ffffff' },
  { name: 'Warm Cream', fg: '#1c1917', bg: '#fffbf5' },
];

export const StylePanel: React.FC<StylePanelProps> = ({
  customization,
  setCustomization,
  onResetStyle,
}) => {
  const [activeTab, setActiveTab] = React.useState<'colors' | 'shapes' | 'dimensions' | 'logo'>(
    'colors'
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const contrast = analyzeContrast(customization.fgColor, customization.bgColor);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please use an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomization((prev) => ({
        ...prev,
        logo: dataUrl,
        logoName: file.name,
        // Auto-recommend High error correction when logo is present
        errorCorrectionLevel: 'H',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPresetLogo = (svgDataUri: string, name: string) => {
    setCustomization((prev) => ({
      ...prev,
      logo: svgDataUri,
      logoName: `${name} Icon`,
      errorCorrectionLevel: 'H',
    }));
  };

  const handleRemoveLogo = () => {
    setCustomization((prev) => ({
      ...prev,
      logo: null,
      logoName: undefined,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">2. Customization Studio</h2>
          <p className="text-xs text-slate-400">Design colors, corners, modules, margin, and center logo</p>
        </div>

        <button
          type="button"
          onClick={onResetStyle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Style
        </button>
      </div>

      {/* Studio Sub-Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'colors'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Colors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shapes')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'shapes'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shapes className="w-3.5 h-3.5" />
          <span>Shapes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dimensions')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dimensions'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Options</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logo')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logo'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo</span>
          {customization.logo && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          )}
        </button>
      </div>

      {/* Tab 1: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-5">
          {/* Preset Palettes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Curated Color Palettes
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setCustomization((prev) => ({
                      ...prev,
                      fgColor: preset.fg,
                      bgColor: preset.bg,
                      isTransparentBg: false,
                    }))
                  }
                  className="flex items-center gap-2.5 p-2 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all cursor-pointer text-left group"
                >
                  <div className="w-5 h-5 rounded-lg border border-slate-700 overflow-hidden flex shadow-xs shrink-0">
                    <span className="w-1/2 h-full" style={{ backgroundColor: preset.fg }} />
                    <span className="w-1/2 h-full" style={{ backgroundColor: preset.bg }} />
                  </div>
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Foreground & Background Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fg-color" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foreground (Dots & Patterns)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color"
                  type="color"
                  value={customization.fgColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, fgColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={customization.fgColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, fgColor: e.target.value }))
                  }
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="bg-color" className="block text-xs font-semibold text-slate-300">
                  Background Canvas
                </label>
                <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customization.isTransparentBg}
                    onChange={(e) =>
                      setCustomization((prev) => ({ ...prev, isTransparentBg: e.target.checked }))
                    }
                    className="w-3 h-3 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Transparent</span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="bg-color"
                  type="color"
                  disabled={customization.isTransparentBg}
                  value={customization.bgColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, bgColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5 disabled:opacity-40"
                />
                <input
                  type="text"
                  disabled={customization.isTransparentBg}
                  value={customization.isTransparentBg ? 'Transparent' : customization.bgColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, bgColor: e.target.value }))
                  }
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 uppercase disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          {/* Contrast & Scan Safety Meter */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
              contrast.rating === 'critical'
                ? 'bg-red-950/50 border-red-800 text-red-200'
                : contrast.rating === 'caution'
                ? 'bg-amber-950/50 border-amber-800 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            }`}
          >
            {contrast.rating === 'optimal' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-semibold mb-0.5">
                <span>Contrast Ratio: {contrast.ratio}:1</span>
                <span className="uppercase text-[10px] tracking-wide px-1.5 py-0.5 rounded bg-black/30">
                  {contrast.rating}
                </span>
              </div>
              <p className="text-[11px] opacity-90">{contrast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shapes & Patterns */}
      {activeTab === 'shapes' && (
        <div className="space-y-5">
          {/* Module Shapes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Body Module Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'square' as ModuleStyle, label: 'Classic Square', desc: 'Standard sharp' },
                { id: 'rounded' as ModuleStyle, label: 'Rounded Blocks', desc: 'Soft & modern' },
                { id: 'dots' as ModuleStyle, label: 'Circular Dots', desc: 'High-tech' },
                { id: 'squircle' as ModuleStyle, label: 'Squircle', desc: 'Premium luxury' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() =>
                    setCustomization((prev) => ({ ...prev, moduleStyle: style.id }))
                  }
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    customization.moduleStyle === style.id
                      ? 'border-indigo-500 bg-indigo-950/50 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{style.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Corner Eyes Shapes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Corner Eyes (Finder Patterns)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'square' as CornerStyle, label: 'Square Frame', desc: 'Default standard' },
                { id: 'rounded' as CornerStyle, label: 'Smooth Rounded', desc: 'Rounded edges' },
                { id: 'circle' as CornerStyle, label: 'Concentric Ring', desc: 'Bullseye circular' },
                { id: 'leaf' as CornerStyle, label: 'Leaf / Curved', desc: 'Organic diagonal' },
              ].map((cStyle) => (
                <button
                  key={cStyle.id}
                  type="button"
                  onClick={() =>
                    setCustomization((prev) => ({ ...prev, cornerStyle: cStyle.id }))
                  }
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    customization.cornerStyle === cStyle.id
                      ? 'border-indigo-500 bg-indigo-950/50 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{cStyle.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{cStyle.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Corner Eye Color */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Distinct Corner Eye Color
                </label>
                <p className="text-[11px] text-slate-400">
                  Apply a contrasting accent color to the three corner markers
                </p>
              </div>
              <input
                type="checkbox"
                checked={customization.customCornerColor}
                onChange={(e) =>
                  setCustomization((prev) => ({
                    ...prev,
                    customCornerColor: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {customization.customCornerColor && (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customization.cornerColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, cornerColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={customization.cornerColor}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, cornerColor: e.target.value }))
                  }
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Dimensions & Error Correction */}
      {activeTab === 'dimensions' && (
        <div className="space-y-5">
          {/* Margin / Quiet Zone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="margin-slider" className="text-xs font-semibold text-slate-300">
                Quiet Zone Margin
              </label>
              <span className="text-xs font-mono text-indigo-400 font-bold">
                {customization.margin} modules
              </span>
            </div>
            <input
              id="margin-slider"
              type="range"
              min={0}
              max={5}
              step={1}
              value={customization.margin}
              onChange={(e) =>
                setCustomization((prev) => ({ ...prev, margin: parseInt(e.target.value, 10) }))
              }
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 (None)</span>
              <span>1</span>
              <span>2 (Standard)</span>
              <span>3</span>
              <span>4 (ISO Spec)</span>
              <span>5</span>
            </div>
            {customization.margin < 2 && (
              <p className="mt-1.5 text-[11px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Quiet zones under 2 modules can fail if printed on busy backgrounds.
              </p>
            )}
          </div>

          {/* Error Correction Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Error Correction Level
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-400" />
                Self-healing redundancy
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'L' as ErrorCorrectionLevel, title: 'Low (7%)', desc: 'Simplest matrix' },
                { id: 'M' as ErrorCorrectionLevel, title: 'Medium (15%)', desc: 'Recommended default' },
                { id: 'Q' as ErrorCorrectionLevel, title: 'Quartile (25%)', desc: 'High resilience' },
                { id: 'H' as ErrorCorrectionLevel, title: 'High (30%)', desc: 'Required for logos' },
              ].map((ec) => (
                <button
                  key={ec.id}
                  type="button"
                  onClick={() =>
                    setCustomization((prev) => ({ ...prev, errorCorrectionLevel: ec.id }))
                  }
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    customization.errorCorrectionLevel === ec.id
                      ? 'border-indigo-500 bg-indigo-950/50 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="text-xs font-semibold">{ec.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{ec.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Output Size Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Default Export Size Preset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[256, 512, 1024, 2048].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCustomization((prev) => ({ ...prev, size: s }))}
                  className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    customization.size === s
                      ? 'border-indigo-500 bg-indigo-950/50 text-white ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <span className="text-xs">{s}px</span>
                  <span className="block text-[9px] text-slate-500">
                    {s === 256 ? 'Web' : s === 512 ? 'Standard' : s === 1024 ? 'HD' : 'Print 300DPI'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Center Logo */}
      {activeTab === 'logo' && (
        <div className="space-y-5">
          {/* File Upload & Current Logo Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Custom Logo Image (PNG, SVG, JPG, WebP)
            </label>

            {customization.logo ? (
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center shrink-0">
                    <img
                      src={customization.logo}
                      alt="Uploaded QR logo"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white truncate max-w-[180px]">
                      {customization.logoName || 'Center Logo'}
                    </div>
                    <div className="text-[11px] text-emerald-400">Embedded in QR center</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                    title="Remove logo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-900/60"
              >
                <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs font-medium text-slate-300 block">
                  Click to upload brand logo
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  PNG, SVG, JPG, WebP up to 5MB (processed locally in browser)
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Quick Preset Vector Logos */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Or Choose Preset Vector Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_LOGOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleApplyPresetLogo(item.svgDataUri, item.name)}
                  className="p-2 rounded-xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800 flex flex-col items-center gap-1 transition-all cursor-pointer group"
                  title={`Use ${item.name} icon`}
                >
                  <div className="w-7 h-7 flex items-center justify-center">
                    <img
                      src={item.svgDataUri}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate w-full text-center">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Size and Cutout Controls (when logo is present) */}
          {customization.logo && (
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="logo-scale-slider" className="text-xs font-semibold text-slate-300">
                    Logo Scale Size
                  </label>
                  <span className="text-xs font-mono text-indigo-400 font-bold">
                    {Math.round(customization.logoSize * 100)}% of QR Code
                  </span>
                </div>
                <input
                  id="logo-scale-slider"
                  type="range"
                  min={0.12}
                  max={0.28}
                  step={0.02}
                  value={customization.logoSize}
                  onChange={(e) =>
                    setCustomization((prev) => ({
                      ...prev,
                      logoSize: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                {customization.logoSize > 0.24 && (
                  <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Large logos cover more data. Error correction has been locked to High (30%).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Logo Cutout Badge Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'rounded', label: 'Rounded Square' },
                    { id: 'circle', label: 'Circle Badge' },
                    { id: 'none', label: 'Transparent' },
                  ].map((badge) => (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() =>
                        setCustomization((prev) => ({
                          ...prev,
                          logoBgShape: badge.id as 'circle' | 'rounded' | 'none',
                        }))
                      }
                      className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                        customization.logoBgShape === badge.id
                          ? 'border-indigo-500 bg-indigo-950/50 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {badge.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
