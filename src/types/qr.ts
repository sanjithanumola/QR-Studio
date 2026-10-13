export type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type ModuleStyle = 'square' | 'rounded' | 'dots' | 'squircle';

export type CornerStyle = 'square' | 'rounded' | 'circle' | 'leaf';

export interface UrlData {
  url: string;
  autoHttps: boolean;
}

export interface TextData {
  text: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  jobTitle: string;
  website: string;
  street: string;
  city: string;
  country: string;
}

export interface EmailData {
  email: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phone: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface QrCustomization {
  fgColor: string;
  bgColor: string;
  isTransparentBg: boolean;
  moduleStyle: ModuleStyle;
  cornerStyle: CornerStyle;
  customCornerColor: boolean;
  cornerColor: string;
  size: number; // 256 | 512 | 1024 | 2048
  margin: number; // 0 to 6
  errorCorrectionLevel: ErrorCorrectionLevel;
  logo: string | null; // dataURL
  logoName?: string;
  logoSize: number; // 0.12 to 0.28
  logoBgShape: 'circle' | 'rounded' | 'none';
  logoPadding: number;
}

export interface SavedDesign {
  id: string;
  name: string;
  type: ContentType;
  createdAt: number;
  thumbnail: string;
  payload: string;
  isSensitive: boolean;
  formData: any;
  options: QrCustomization;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  type: ContentType;
  icon: string;
  badge: string;
  formData: any;
  customization: Partial<QrCustomization>;
}
