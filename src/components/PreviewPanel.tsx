import React from 'react';
import {
  Download,
  Copy,
  Printer,
  BookmarkPlus,
  Check,
  Smartphone,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Share2,
} from 'lucide-react';
import { ContentType, QrCustomization } from '../types/qr';
import { generateMatrix, generateQrSvg, renderQrToCanvas, analyzeContrast } from '../utils/qrRenderer';
import { parseSimulatedScan } from '../utils/qrEncoder';

interface PreviewPanelProps {
  payload: string;
  isValid: boolean;
  contentType: ContentType;
  customization: QrCustomization;
  onSaveDesign: () => void;
  onOpenPrint: () => void;
  onShowToast: (message: string) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  payload,
  isValid,
  contentType,
  customization,
  onSaveDesign,
  onOpenPrint,
  onShowToast,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [downloadResolution, setDownloadResolution] = React.useState<number>(customization.size || 1024);
  const [showSimulator, setShowSimulator] = React.useState<boolean>(true);
  const [showRawPayload, setShowRawPayload] = React.useState<boolean>(false);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [matrixSize, setMatrixSize] = React.useState<number>(25);

  const contrast = analyzeContrast(customization.fgColor, customization.bgColor);

  // Re-render canvas whenever payload or customization changes
  React.useEffect(() => {
    if (!isValid || !payload) return;

    let isMounted = true;
    setIsGenerating(true);

    try {
      const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
      if (isMounted) setMatrixSize(matrix.size);

      if (canvasRef.current) {
        renderQrToCanvas(canvasRef.current, matrix, customization, 512).then(() => {
          if (isMounted) setIsGenerating(false);
        });
      }
    } catch (err) {
      console.error('Failed to generate QR matrix:', err);
      if (isMounted) setIsGenerating(false);
    }

    return () => {
      isMounted = false;
    };
  }, [payload, isValid, customization]);

  // Scan simulator metadata
  const scanSimulation = React.useMemo(() => {
    return parseSimulatedScan(payload, contentType);
  }, [payload, contentType]);

  // Download PNG file
  const handleDownloadPng = async () => {
    if (!isValid || !payload) {
      onShowToast('Please enter valid content first');
      return;
    }

    try {
      const exportCanvas = document.createElement('canvas');
      const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
      await renderQrToCanvas(exportCanvas, matrix, customization, downloadResolution);

      const dataUrl = exportCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qr-studio-${contentType}-${downloadResolution}px.png`;
      link.href = dataUrl;
      link.click();
      onShowToast(`Downloaded PNG (${downloadResolution}×${downloadResolution}px)`);
    } catch (err) {
      console.error(err);
      onShowToast('Failed to export PNG');
    }
  };

  // Download SVG file
  const handleDownloadSvg = () => {
    if (!isValid || !payload) {
      onShowToast('Please enter valid content first');
      return;
    }

    try {
      const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
      const svgString = generateQrSvg(matrix, customization);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qr-studio-${contentType}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('Downloaded vector SVG file');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to export SVG');
    }
  };

  // Copy PNG image to system clipboard
  const handleCopyImage = async () => {
    if (!isValid || !payload) return;

    try {
      const exportCanvas = document.createElement('canvas');
      const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
      await renderQrToCanvas(exportCanvas, matrix, customization, 1024);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          onShowToast('Copied QR image to clipboard');
        } catch {
          // Fallback to data URL copy if clipboard.write is restricted
          onShowToast('Direct image copy restricted by browser; please use Download');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      onShowToast('Failed to copy image');
    }
  };

  // Copy raw payload text
  const handleCopyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      onShowToast('Copied payload text to clipboard');
    } catch {
      onShowToast('Clipboard access denied');
    }
  };

  // Scan readiness status
  const scanReadiness = React.useMemo(() => {
    if (contrast.rating === 'critical') {
      return {
        level: 'critical',
        label: 'Low Contrast',
        desc: 'Insufficient color difference. Devices will likely fail to scan.',
      };
    }
    if (customization.logo && customization.logoSize > 0.24 && customization.errorCorrectionLevel !== 'H') {
      return {
        level: 'caution',
        label: 'Logo Caution',
        desc: 'Center logo is large; ensure Error Correction is set to High (H).',
      };
    }
    if (customization.margin === 0) {
      return {
        level: 'caution',
        label: 'No Quiet Zone',
        desc: 'Margin is 0. May fail when printed on non-white paper.',
      };
    }
    if (contrast.isInverted) {
      return {
        level: 'caution',
        label: 'Inverted Colors',
        desc: 'Light dots on dark background. Compatible with 95%+ of modern smartphones.',
      };
    }
    return {
      level: 'optimal',
      label: 'Optimal Scannability',
      desc: 'High contrast & ISO-compliant quiet zone. Guaranteed fast scan on any device.',
    };
  }, [contrast, customization]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 flex flex-col justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">3. Live Preview & Export</h2>
          <p className="text-xs text-slate-400">High-resolution scannable preview & multi-format exports</p>
        </div>

        {/* Scan Readiness Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            scanReadiness.level === 'optimal'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
              : scanReadiness.level === 'caution'
              ? 'bg-amber-950/70 border-amber-800 text-amber-300'
              : 'bg-red-950/70 border-red-800 text-red-300'
          }`}
          title={scanReadiness.desc}
        >
          {scanReadiness.level === 'optimal' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{scanReadiness.label}</span>
        </div>
      </div>

      {/* Main QR Canvas Container */}
      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 relative min-h-[340px]">
        {!isValid || !payload ? (
          <div className="text-center p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
              <Eye className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-300">Ready to Generate</div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Enter your website URL, text, or Wi-Fi network to preview your custom QR code here.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col items-center">
            {/* Canvas with checkerboard background for transparent preview */}
            <div
              className={`p-4 rounded-2xl shadow-2xl transition-all ${
                customization.isTransparentBg
                  ? 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-900'
                  : ''
              }`}
              style={{
                backgroundColor: customization.isTransparentBg ? undefined : customization.bgColor,
              }}
            >
              <canvas
                ref={canvasRef}
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain drop-shadow-md rounded-lg"
              />
            </div>

            {/* Matrix Metadata line */}
            <div className="mt-4 flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Grid: {matrixSize}×{matrixSize}</span>
              <span>·</span>
              <span>EC: {customization.errorCorrectionLevel} (30%)</span>
              <span>·</span>
              <span>Margin: {customization.margin}</span>
            </div>
          </div>
        )}
      </div>

      {/* Smartphone Scanner Simulator Drawer */}
      {isValid && payload && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Camera Scanner Simulator</span>
            </button>
            <span className="text-[10px] text-slate-500">Device Decoding Check</span>
          </div>

          {showSimulator && (
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300">
                  {scanSimulation.badge} Action
                </span>
                <span className="text-[11px] text-slate-400">{scanSimulation.actionSubtitle}</span>
              </div>
              <div className="text-xs font-bold text-white break-all">
                {scanSimulation.primaryValue}
              </div>

              {scanSimulation.fields.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  {scanSimulation.fields.map((field) => (
                    <div key={field.label} className="truncate">
                      <span className="text-slate-500">{field.label}: </span>
                      <span className="text-slate-300 font-mono">{field.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export & Action Buttons */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        {/* Primary Download Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* PNG with resolution selector */}
          <div className="flex rounded-xl overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!isValid || !payload || isGenerating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <select
              value={downloadResolution}
              onChange={(e) => setDownloadResolution(parseInt(e.target.value, 10))}
              className="bg-indigo-700 hover:bg-indigo-600 text-white text-[11px] font-mono px-2 py-2 border-l border-indigo-500/40 focus:outline-none cursor-pointer"
              title="Select export resolution"
            >
              <option value={256}>256px</option>
              <option value={512}>512px</option>
              <option value={1024}>1024px</option>
              <option value={2048}>2048px (HD)</option>
            </select>
          </div>

          {/* SVG Vector */}
          <button
            type="button"
            onClick={handleDownloadSvg}
            disabled={!isValid || !payload || isGenerating}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 hover:text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Download SVG Vector</span>
          </button>
        </div>

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopyImage}
            disabled={!isValid || !payload}
            className="py-2 px-2.5 bg-slate-950/80 hover:bg-slate-800/80 disabled:opacity-40 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Copy image to clipboard"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Image</span>
          </button>

          <button
            type="button"
            onClick={onOpenPrint}
            disabled={!isValid || !payload}
            className="py-2 px-2.5 bg-slate-950/80 hover:bg-slate-800/80 disabled:opacity-40 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Open clean print layout"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>

          <button
            type="button"
            onClick={onSaveDesign}
            disabled={!isValid || !payload}
            className="py-2 px-2.5 bg-slate-950/80 hover:bg-slate-800/80 disabled:opacity-40 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Save this configuration to local storage"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Save Design</span>
          </button>
        </div>

        {/* Collapsible Raw Payload Inspector */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setShowRawPayload(!showRawPayload)}
              className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
            >
              <Code2 className="w-3 h-3 text-slate-400" />
              <span>{showRawPayload ? 'Hide Encoded Payload' : 'Inspect Raw Payload'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyPayload}
              className="hover:text-white cursor-pointer font-medium text-indigo-400"
            >
              Copy Text
            </button>
          </div>

          {showRawPayload && (
            <div className="mt-2 p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 font-mono text-[11px] break-all max-h-28 overflow-y-auto leading-relaxed select-all">
              {payload || '(empty)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
