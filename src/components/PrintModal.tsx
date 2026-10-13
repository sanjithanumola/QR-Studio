import React from 'react';
import { X, Printer, Check } from 'lucide-react';
import { ContentType, QrCustomization } from '../types/qr';
import { generateMatrix, renderQrToCanvas } from '../utils/qrRenderer';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: string;
  contentType: ContentType;
  customization: QrCustomization;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  payload,
  contentType,
  customization,
}) => {
  const [sheetTitle, setSheetTitle] = React.useState<string>('Scan this QR Code');
  const [sheetSubtitle, setSheetSubtitle] = React.useState<string>(
    'Point your smartphone camera at the code to access instantly. No app required.'
  );
  const [layoutStyle, setLayoutStyle] = React.useState<'poster' | 'card' | 'minimal'>('card');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!isOpen || !payload) return;

    // Set smart default title based on content type
    if (contentType === 'wifi') {
      setSheetTitle('Connect to Guest Wi-Fi');
      setSheetSubtitle('Scan with iPhone or Android camera to join our high-speed wireless network.');
    } else if (contentType === 'vcard') {
      setSheetTitle('Digital Business Card');
      setSheetSubtitle('Scan to save contact information directly into your phone address book.');
    } else if (contentType === 'url') {
      setSheetTitle('Visit Our Website');
      setSheetSubtitle('Scan with any camera app to open our official website.');
    }

    const timer = setTimeout(() => {
      if (canvasRef.current) {
        const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
        renderQrToCanvas(canvasRef.current, matrix, customization, 800);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, payload, contentType, customization]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden no-print">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Print-Ready Sheet</h3>
              <p className="text-xs text-slate-400">Generate clean paper signage, table tents, or posters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Headline Text</label>
            <input
              type="text"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Format Layout</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'card', label: 'Desk Card' },
                { id: 'poster', label: 'Poster' },
                { id: 'minimal', label: 'Minimal' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setLayoutStyle(style.id as any)}
                  className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    layoutStyle === style.id
                      ? 'border-indigo-500 bg-indigo-950 text-white font-semibold'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Paper Sheet Preview Area */}
        <div className="p-6 overflow-y-auto bg-slate-950 flex justify-center items-center">
          <div
            id="printable-sheet"
            className="w-full max-w-sm bg-white text-slate-900 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-5 border border-slate-200"
          >
            {layoutStyle !== 'minimal' && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 block">
                  Quick Access
                </span>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">{sheetTitle}</h2>
                <p className="text-xs text-slate-600 max-w-xs">{sheetSubtitle}</p>
              </div>
            )}

            {/* QR Canvas */}
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100">
              <canvas ref={canvasRef} className="w-56 h-56 object-contain" />
            </div>

            <div className="pt-2 border-t border-slate-100 w-full text-center">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1">
                <Check className="w-3 h-3 text-indigo-600" /> Compatible with all camera phones
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Powered by QR Studio · Zero App Install Required
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Prints formatted for standard A4 and Letter paper</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden print stylesheet element that becomes visible only on window.print() */}
      <div className="print-only">
        <div className="w-full max-w-md mx-auto p-12 text-center space-y-6">
          <h1 className="text-3xl font-extrabold text-black">{sheetTitle}</h1>
          <p className="text-sm text-gray-700">{sheetSubtitle}</p>
          <div className="flex justify-center my-6">
            <canvas ref={canvasRef} className="w-72 h-72" />
          </div>
          <p className="text-xs text-gray-500">Scan with phone camera to connect instantly.</p>
        </div>
      </div>
    </div>
  );
};
