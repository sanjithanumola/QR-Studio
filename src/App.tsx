import React from 'react';
import { Header } from './components/Header';
import { ContentPanel } from './components/ContentPanel';
import { StylePanel } from './components/StylePanel';
import { PreviewPanel } from './components/PreviewPanel';
import { HistorySection } from './components/HistorySection';
import { TemplatesModal } from './components/TemplatesModal';
import { PrintModal } from './components/PrintModal';
import { SaveModal } from './components/SaveModal';
import { PrivacySection } from './components/PrivacySection';
import { Toast } from './components/Toast';
import {
  ContentType,
  EmailData,
  PhoneData,
  QrCustomization,
  SavedDesign,
  SmsData,
  TemplateItem,
  TextData,
  UrlData,
  VCardData,
  WifiData,
} from './types/qr';
import { buildPayload } from './utils/qrEncoder';
import { generateMatrix, renderQrToCanvas } from './utils/qrRenderer';

const STORAGE_KEY = 'qr_studio_saved_designs_v1';

const DEFAULT_CUSTOMIZATION: QrCustomization = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  isTransparentBg: false,
  moduleStyle: 'rounded',
  cornerStyle: 'rounded',
  customCornerColor: false,
  cornerColor: '#4338ca',
  size: 1024,
  margin: 2,
  errorCorrectionLevel: 'M',
  logo: null,
  logoSize: 0.2,
  logoBgShape: 'rounded',
  logoPadding: 4,
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(true);

  // Form State
  const [contentType, setContentType] = React.useState<ContentType>('url');
  const [urlData, setUrlData] = React.useState<UrlData>({
    url: 'https://qrstudio.app',
    autoHttps: true,
  });
  const [textData, setTextData] = React.useState<TextData>({
    text: 'Hello from QR Studio! Scan me with any phone camera.',
  });
  const [wifiData, setWifiData] = React.useState<WifiData>({
    ssid: 'Guest_WiFi_Studio',
    password: 'WelcomeToStudio2026',
    security: 'WPA',
    hidden: false,
  });
  const [vcardData, setVcardData] = React.useState<VCardData>({
    firstName: 'Alex',
    lastName: 'Morgan',
    phone: '+1 (555) 019-2834',
    email: 'alex@qrstudio.app',
    organization: 'QR Studio Inc.',
    jobTitle: 'Creative Director',
    website: 'https://qrstudio.app',
    street: '100 Market St',
    city: 'San Francisco',
    country: 'USA',
  });
  const [emailData, setEmailData] = React.useState<EmailData>({
    email: 'support@qrstudio.app',
    subject: 'Project Inquiry',
    body: 'Hello team, I would like to learn more about your services.',
  });
  const [phoneData, setPhoneData] = React.useState<PhoneData>({
    phone: '+1 800 555 0199',
  });
  const [smsData, setSmsData] = React.useState<SmsData>({
    phone: '+1 800 555 0199',
    message: 'Hello! I am inquiring about your QR code solutions.',
  });

  // Customization styling state
  const [customization, setCustomization] = React.useState<QrCustomization>(DEFAULT_CUSTOMIZATION);

  // Modals & Feedback
  const [isTemplatesOpen, setIsTemplatesOpen] = React.useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = React.useState<boolean>(false);
  const [isSaveOpen, setIsSaveOpen] = React.useState<boolean>(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Saved Designs in LocalStorage
  const [savedDesigns, setSavedDesigns] = React.useState<SavedDesign[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Sync saved designs to localStorage
  const saveDesignsToStorage = (designs: SavedDesign[]) => {
    setSavedDesigns(designs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Active form data getter
  const currentFormData = React.useMemo(() => {
    switch (contentType) {
      case 'url':
        return urlData;
      case 'text':
        return textData;
      case 'wifi':
        return wifiData;
      case 'vcard':
        return vcardData;
      case 'email':
        return emailData;
      case 'phone':
        return phoneData;
      case 'sms':
        return smsData;
      default:
        return urlData;
    }
  }, [contentType, urlData, textData, wifiData, vcardData, emailData, phoneData, smsData]);

  // Compute QR payload
  const { payload, isValid, error: payloadError } = React.useMemo(() => {
    return buildPayload(contentType, currentFormData);
  }, [contentType, currentFormData]);

  // Reset form content
  const handleResetContent = () => {
    switch (contentType) {
      case 'url':
        setUrlData({ url: '', autoHttps: true });
        break;
      case 'text':
        setTextData({ text: '' });
        break;
      case 'wifi':
        setWifiData({ ssid: '', password: '', security: 'WPA', hidden: false });
        break;
      case 'vcard':
        setVcardData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          organization: '',
          jobTitle: '',
          website: '',
          street: '',
          city: '',
          country: '',
        });
        break;
      case 'email':
        setEmailData({ email: '', subject: '', body: '' });
        break;
      case 'phone':
        setPhoneData({ phone: '' });
        break;
      case 'sms':
        setSmsData({ phone: '', message: '' });
        break;
    }
    showToast('Cleared content fields');
  };

  // Reset styling
  const handleResetStyle = () => {
    setCustomization(DEFAULT_CUSTOMIZATION);
    showToast('Reset styling to defaults');
  };

  // New QR code button
  const handleNewQr = () => {
    setContentType('url');
    setUrlData({ url: 'https://', autoHttps: true });
    setCustomization(DEFAULT_CUSTOMIZATION);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Started new QR code');
  };

  // Apply template
  const handleSelectTemplate = (template: TemplateItem) => {
    setContentType(template.type);
    switch (template.type) {
      case 'url':
        setUrlData(template.formData as UrlData);
        break;
      case 'wifi':
        setWifiData(template.formData as WifiData);
        break;
      case 'vcard':
        setVcardData(template.formData as VCardData);
        break;
      case 'email':
        setEmailData(template.formData as EmailData);
        break;
      case 'text':
        setTextData(template.formData as TextData);
        break;
      case 'phone':
        setPhoneData(template.formData as PhoneData);
        break;
      case 'sms':
        setSmsData(template.formData as SmsData);
        break;
    }

    if (template.customization) {
      setCustomization((prev) => ({
        ...prev,
        ...template.customization,
      }));
    }

    showToast(`Loaded "${template.title}" template`);
  };

  // Save current design
  const handleConfirmSave = async (designName: string, isSensitive: boolean) => {
    if (!isValid || !payload) return;

    try {
      // Create a small thumbnail dataURL
      const thumbCanvas = document.createElement('canvas');
      const matrix = generateMatrix(payload, customization.errorCorrectionLevel);
      await renderQrToCanvas(thumbCanvas, matrix, customization, 180);
      const thumbUrl = thumbCanvas.toDataURL('image/png');

      const newDesign: SavedDesign = {
        id: `design-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: designName,
        type: contentType,
        createdAt: Date.now(),
        thumbnail: thumbUrl,
        payload: isSensitive ? '' : payload,
        isSensitive,
        formData: isSensitive
          ? contentType === 'wifi'
            ? { ...wifiData, password: '' }
            : currentFormData
          : currentFormData,
        options: { ...customization },
      };

      const updated = [newDesign, ...savedDesigns.slice(0, 49)]; // store up to 50 designs
      saveDesignsToStorage(updated);
      showToast(`Saved "${designName}" to history`);
    } catch (err) {
      console.error(err);
      showToast('Could not save design');
    }
  };

  // Reload saved design
  const handleLoadSavedDesign = (design: SavedDesign) => {
    setContentType(design.type);
    if (design.formData) {
      switch (design.type) {
        case 'url':
          setUrlData(design.formData);
          break;
        case 'text':
          setTextData(design.formData);
          break;
        case 'wifi':
          setWifiData(design.formData);
          break;
        case 'vcard':
          setVcardData(design.formData);
          break;
        case 'email':
          setEmailData(design.formData);
          break;
        case 'phone':
          setPhoneData(design.formData);
          break;
        case 'sms':
          setSmsData(design.formData);
          break;
      }
    }
    setCustomization(design.options);
  };

  const handleDeleteSavedDesign = (id: string) => {
    const updated = savedDesigns.filter((d) => d.id !== id);
    saveDesignsToStorage(updated);
  };

  const handleClearAllDesigns = () => {
    saveDesignsToStorage([]);
  };

  const handleRenameDesign = (id: string, newName: string) => {
    const updated = savedDesigns.map((d) => (d.id === id ? { ...d, name: newName } : d));
    saveDesignsToStorage(updated);
  };

  // Suggest default name when saving
  const suggestedSaveName = React.useMemo(() => {
    switch (contentType) {
      case 'url': {
        try {
          const host = new URL(urlData.url.startsWith('http') ? urlData.url : `https://${urlData.url}`).hostname;
          return `${host || 'Website'} QR`;
        } catch {
          return 'Website QR';
        }
      }
      case 'wifi':
        return `${wifiData.ssid || 'Guest'} Wi-Fi`;
      case 'vcard':
        return `${vcardData.firstName || 'Business'} ${vcardData.lastName || 'Card'}`.trim();
      case 'email':
        return `Email to ${emailData.email || 'Contact'}`;
      case 'phone':
        return `Phone Call ${phoneData.phone}`;
      case 'sms':
        return `SMS to ${smsData.phone}`;
      default:
        return 'Custom QR Code';
    }
  }, [contentType, urlData, wifiData, vcardData, emailData, phoneData, smsData]);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'}`}>
      {/* Top Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onNewQr={handleNewQr}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <div id="generator" className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-3 py-1 rounded-full">
            <span>Client-Side Vector Engine</span>
            <span>·</span>
            <span>No Accounts or API Keys</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
            Create your QR code.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Design scannable, high-res QR codes for websites, Wi-Fi networks, vCards, emails, and phone numbers. Customize corner shapes, colors, center logos, and export vector SVG or PNG print sheets.
          </p>
        </div>

        {/* 2-Column Responsive Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form & Style Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <ContentPanel
              contentType={contentType}
              onChangeType={setContentType}
              urlData={urlData}
              setUrlData={setUrlData}
              textData={textData}
              setTextData={setTextData}
              wifiData={wifiData}
              setWifiData={setWifiData}
              vcardData={vcardData}
              setVcardData={setVcardData}
              emailData={emailData}
              setEmailData={setEmailData}
              phoneData={phoneData}
              setPhoneData={setPhoneData}
              smsData={smsData}
              setSmsData={setSmsData}
              onOpenTemplates={() => setIsTemplatesOpen(true)}
              onResetContent={handleResetContent}
              errorMessage={payloadError}
            />

            <StylePanel
              customization={customization}
              setCustomization={setCustomization}
              onResetStyle={handleResetStyle}
            />
          </div>

          {/* Right Column: Live Preview & Action Center (5 cols on lg, sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <PreviewPanel
              payload={payload}
              isValid={isValid}
              contentType={contentType}
              customization={customization}
              onSaveDesign={() => setIsSaveOpen(true)}
              onOpenPrint={() => setIsPrintOpen(true)}
              onShowToast={showToast}
            />
          </div>
        </div>

        {/* Recent QR Codes Section */}
        <HistorySection
          designs={savedDesigns}
          onLoadDesign={handleLoadSavedDesign}
          onDeleteDesign={handleDeleteSavedDesign}
          onClearAll={handleClearAllDesigns}
          onRenameDesign={handleRenameDesign}
          onShowToast={showToast}
        />

        {/* Privacy, Reliability & FAQ Section */}
        <PrivacySection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-center text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-300">
          <span>QR Studio</span>
          <span>·</span>
          <span className="font-normal text-slate-400">Custom QR Code Generator & Studio</span>
        </div>
        <p>
          Runs 100% locally in your browser. Encoded payloads and custom logos never leave your computer.
        </p>
      </footer>

      {/* Modals */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        payload={payload}
        contentType={contentType}
        customization={customization}
      />

      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        contentType={contentType}
        defaultName={suggestedSaveName}
        onConfirmSave={handleConfirmSave}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
