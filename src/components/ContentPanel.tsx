import React from 'react';
import {
  Globe,
  FileText,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ContentType, EmailData, PhoneData, SmsData, TextData, UrlData, VCardData, WifiData } from '../types/qr';

interface ContentPanelProps {
  contentType: ContentType;
  onChangeType: (type: ContentType) => void;
  urlData: UrlData;
  setUrlData: React.Dispatch<React.SetStateAction<UrlData>>;
  textData: TextData;
  setTextData: React.Dispatch<React.SetStateAction<TextData>>;
  wifiData: WifiData;
  setWifiData: React.Dispatch<React.SetStateAction<WifiData>>;
  vcardData: VCardData;
  setVcardData: React.Dispatch<React.SetStateAction<VCardData>>;
  emailData: EmailData;
  setEmailData: React.Dispatch<React.SetStateAction<EmailData>>;
  phoneData: PhoneData;
  setPhoneData: React.Dispatch<React.SetStateAction<PhoneData>>;
  smsData: SmsData;
  setSmsData: React.Dispatch<React.SetStateAction<SmsData>>;
  onOpenTemplates: () => void;
  onResetContent: () => void;
  errorMessage?: string;
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  contentType,
  onChangeType,
  urlData,
  setUrlData,
  textData,
  setTextData,
  wifiData,
  setWifiData,
  vcardData,
  setVcardData,
  emailData,
  setEmailData,
  phoneData,
  setPhoneData,
  smsData,
  setSmsData,
  onOpenTemplates,
  onResetContent,
  errorMessage,
}) => {
  const [showWifiPassword, setShowWifiPassword] = React.useState(false);

  const tabs: { id: ContentType; label: string; icon: React.ElementType }[] = [
    { id: 'url', label: 'Website URL', icon: Globe },
    { id: 'text', label: 'Plain Text', icon: FileText },
    { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
    { id: 'vcard', label: 'Contact Card', icon: Contact },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'sms', label: 'SMS Message', icon: MessageSquare },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Top Header Row with Templates & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">1. Content & Payload</h2>
          <p className="text-xs text-slate-400">Select the destination type and enter data to encode</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/70 border border-indigo-800/80 rounded-lg hover:bg-indigo-900/80 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Load Template
          </button>
          <button
            type="button"
            onClick={onResetContent}
            title="Reset current content form"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = contentType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeType(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Fields according to selected Content Type */}
      <div className="space-y-4">
        {/* 1. URL */}
        {contentType === 'url' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="url-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Destination Website URL <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="url-input"
                  type="text"
                  placeholder="https://example.com/product?ref=qr"
                  value={urlData.url}
                  onChange={(e) => setUrlData({ ...urlData, url: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={urlData.autoHttps}
                    onChange={(e) => setUrlData({ ...urlData, autoHttps: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Automatically prepend https:// if protocol is omitted</span>
                </label>
                <span className="font-mono text-[11px] text-slate-500">
                  {urlData.url.length} chars
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Accepts deep links, UTM marketing parameters, and UTF-8 internationalized domain names.
            </p>
          </div>
        )}

        {/* 2. Plain Text */}
        {contentType === 'text' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="text-input" className="block text-xs font-semibold text-slate-300">
                Text or Note <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {textData.text.length} characters · {new TextEncoder().encode(textData.text).length} UTF-8 bytes
              </span>
            </div>
            <textarea
              id="text-input"
              rows={4}
              placeholder="Enter plain text, notes, coupon codes, serial numbers, or unicode messages..."
              value={textData.text}
              onChange={(e) => setTextData({ text: e.target.value })}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400">
              Preserves line breaks, unicode symbols, emoji, and non-Latin alphabets accurately.
            </p>
          </div>
        )}

        {/* 3. Wi-Fi */}
        {contentType === 'wifi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="wifi-ssid" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Network Name (SSID) <span className="text-indigo-400">*</span>
                </label>
                <input
                  id="wifi-ssid"
                  type="text"
                  placeholder="e.g. MyHome_Network_5G"
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="wifi-security" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security Protocol
                </label>
                <select
                  id="wifi-security"
                  value={wifiData.security}
                  onChange={(e) =>
                    setWifiData({
                      ...wifiData,
                      security: e.target.value as 'WPA' | 'WEP' | 'nopass',
                    })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                  <option value="WEP">WEP (Legacy)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
            </div>

            {wifiData.security !== 'nopass' && (
              <div>
                <label htmlFor="wifi-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Wi-Fi Password <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="wifi-password"
                    type={showWifiPassword ? 'text' : 'password'}
                    placeholder="Enter network security passphrase"
                    value={wifiData.password}
                    onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword(!showWifiPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showWifiPassword ? 'Hide password' : 'Show password'}
                  >
                    {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wifiData.hidden}
                  onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>Hidden Network (SSID broadcast disabled)</span>
              </label>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                iOS & Android Auto-Connect
              </span>
            </div>
          </div>
        )}

        {/* 4. Contact Card (vCard) */}
        {contentType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah"
                  value={vcardData.firstName}
                  onChange={(e) => setVcardData({ ...vcardData, firstName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Connor"
                  value={vcardData.lastName}
                  onChange={(e) => setVcardData({ ...vcardData, lastName: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={vcardData.phone}
                  onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={vcardData.email}
                  onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Innovations"
                  value={vcardData.organization}
                  onChange={(e) => setVcardData({ ...vcardData, organization: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="Creative Director"
                  value={vcardData.jobTitle}
                  onChange={(e) => setVcardData({ ...vcardData, jobTitle: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website</label>
                <input
                  type="text"
                  placeholder="https://acme.org"
                  value={vcardData.website}
                  onChange={(e) => setVcardData({ ...vcardData, website: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="Austin, TX"
                  value={vcardData.city}
                  onChange={(e) => setVcardData({ ...vcardData, city: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="USA"
                  value={vcardData.country}
                  onChange={(e) => setVcardData({ ...vcardData, country: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. Email */}
        {contentType === 'email' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="email-recipient" className="block text-xs font-semibold text-slate-300 mb-1">
                Recipient Email <span className="text-indigo-400">*</span>
              </label>
              <input
                id="email-recipient"
                type="email"
                placeholder="contact@company.com"
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email-subject" className="block text-xs font-semibold text-slate-300 mb-1">
                Subject Line (Optional)
              </label>
              <input
                id="email-subject"
                type="text"
                placeholder="Customer Support Inquiry"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email-body" className="block text-xs font-semibold text-slate-300 mb-1">
                Prefilled Body Message (Optional)
              </label>
              <textarea
                id="email-body"
                rows={3}
                placeholder="Hello, I would like to enquire about..."
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 6. Phone */}
        {contentType === 'phone' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-indigo-400">*</span>
              </label>
              <input
                id="phone-number"
                type="tel"
                placeholder="+1 800 555 0199"
                value={phoneData.phone}
                onChange={(e) => setPhoneData({ phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Generates a standard `tel:` protocol URI. When scanned, compatible phones will prompt to call this number immediately.
            </p>
          </div>
        )}

        {/* 7. SMS */}
        {contentType === 'sms' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="sms-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-indigo-400">*</span>
              </label>
              <input
                id="sms-phone"
                type="tel"
                placeholder="+1 800 555 0199"
                value={smsData.phone}
                onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label htmlFor="sms-body" className="block text-xs font-semibold text-slate-300 mb-1">
                Prefilled Text Message (Optional)
              </label>
              <textarea
                id="sms-body"
                rows={3}
                placeholder="Hi, I am interested in scheduling a demo."
                value={smsData.message}
                onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation / Error banner if any */}
      {errorMessage && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center gap-2.5 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
