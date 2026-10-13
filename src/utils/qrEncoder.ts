import { ContentType, EmailData, PhoneData, SmsData, TextData, UrlData, VCardData, WifiData } from '../types/qr';

/**
 * Escapes characters for Wi-Fi QR code syntax according to the ZXing barcode standard
 * Backslash, semicolon, comma, colon, and double-quote must be escaped with a backslash.
 */
function escapeWifi(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

export function buildPayload(
  type: ContentType,
  data: UrlData | TextData | WifiData | VCardData | EmailData | PhoneData | SmsData
): { payload: string; isValid: boolean; error?: string } {
  switch (type) {
    case 'url': {
      const urlData = data as UrlData;
      let rawUrl = (urlData.url || '').trim();
      if (!rawUrl) {
        return { payload: '', isValid: false, error: 'Please enter a website URL' };
      }
      if (urlData.autoHttps && !/^https?:\/\//i.test(rawUrl)) {
        rawUrl = `https://${rawUrl}`;
      }
      try {
        // Validate URL structure if it has protocol
        if (/^https?:\/\//i.test(rawUrl)) {
          new URL(rawUrl);
        }
        return { payload: rawUrl, isValid: true };
      } catch {
        return { payload: rawUrl, isValid: false, error: 'Please enter a valid URL (e.g. example.com)' };
      }
    }

    case 'text': {
      const textData = data as TextData;
      const text = textData.text || '';
      if (!text.trim()) {
        return { payload: '', isValid: false, error: 'Please enter some text' };
      }
      return { payload: text, isValid: true };
    }

    case 'wifi': {
      const wifi = data as WifiData;
      const ssid = (wifi.ssid || '').trim();
      if (!ssid) {
        return { payload: '', isValid: false, error: 'Network name (SSID) is required' };
      }
      const security = wifi.security || 'WPA';
      const password = wifi.password || '';
      if (security !== 'nopass' && !password) {
        return { payload: '', isValid: false, error: 'Password is required for secured Wi-Fi networks' };
      }

      const escapedSsid = escapeWifi(ssid);
      const escapedPass = security === 'nopass' ? '' : escapeWifi(password);
      const hidden = wifi.hidden ? 'true' : 'false';

      // Standard ZXing Wi-Fi payload
      const payload = `WIFI:T:${security};S:${escapedSsid};P:${escapedPass};H:${hidden};;`;
      return { payload, isValid: true };
    }

    case 'vcard': {
      const card = data as VCardData;
      const firstName = (card.firstName || '').trim();
      const lastName = (card.lastName || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();

      if (!fullName && !card.phone && !card.email) {
        return { payload: '', isValid: false, error: 'Please enter at least a name, phone, or email' };
      }

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName};${firstName};;;`,
        `FN:${fullName || 'Contact'}`,
      ];

      if (card.organization) lines.push(`ORG:${card.organization.trim()}`);
      if (card.jobTitle) lines.push(`TITLE:${card.jobTitle.trim()}`);
      if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.phone.trim()}`);
      if (card.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${card.email.trim()}`);
      if (card.website) {
        const site = card.website.trim();
        lines.push(`URL:${/^https?:\/\//i.test(site) ? site : `https://${site}`}`);
      }
      if (card.street || card.city || card.country) {
        lines.push(`ADR;TYPE=WORK:;;${card.street || ''};${card.city || ''};;${card.country || ''}`);
      }
      lines.push('END:VCARD');

      return { payload: lines.join('\n'), isValid: true };
    }

    case 'email': {
      const mail = data as EmailData;
      const email = (mail.email || '').trim();
      if (!email) {
        return { payload: '', isValid: false, error: 'Recipient email address is required' };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { payload: '', isValid: false, error: 'Please enter a valid email address' };
      }

      const params = new URLSearchParams();
      if (mail.subject) params.append('subject', mail.subject);
      if (mail.body) params.append('body', mail.body);
      const query = params.toString();
      const payload = `mailto:${email}${query ? `?${query}` : ''}`;
      return { payload, isValid: true };
    }

    case 'phone': {
      const phoneData = data as PhoneData;
      const phone = (phoneData.phone || '').trim();
      if (!phone) {
        return { payload: '', isValid: false, error: 'Phone number is required' };
      }
      return { payload: `tel:${phone}`, isValid: true };
    }

    case 'sms': {
      const sms = data as SmsData;
      const phone = (sms.phone || '').trim();
      if (!phone) {
        return { payload: '', isValid: false, error: 'Phone number is required' };
      }
      const msg = sms.message ? sms.message.trim() : '';
      const payload = msg ? `smsto:${phone}:${msg}` : `smsto:${phone}`;
      return { payload, isValid: true };
    }

    default:
      return { payload: '', isValid: false, error: 'Unknown content type' };
  }
}

export interface SimulatedScanInfo {
  actionTitle: string;
  actionSubtitle: string;
  badge: string;
  primaryValue: string;
  fields: { label: string; value: string }[];
}

export function parseSimulatedScan(payload: string, type: ContentType): SimulatedScanInfo {
  if (!payload) {
    return {
      actionTitle: 'No payload',
      actionSubtitle: 'Enter details to preview',
      badge: 'Empty',
      primaryValue: '',
      fields: [],
    };
  }

  if (type === 'url' || /^https?:\/\//i.test(payload)) {
    return {
      actionTitle: 'Open Website in Browser',
      actionSubtitle: 'Direct link tap',
      badge: 'URL',
      primaryValue: payload,
      fields: [
        { label: 'Host', value: new URL(payload).hostname },
        { label: 'Protocol', value: new URL(payload).protocol.replace(':', '') },
      ],
    };
  }

  if (type === 'wifi' || payload.startsWith('WIFI:')) {
    const ssidMatch = payload.match(/S:([^;]+)/);
    const secMatch = payload.match(/T:([^;]+)/);
    const passMatch = payload.match(/P:([^;]+)/);
    const hiddenMatch = payload.match(/H:([^;]+)/);

    const ssid = ssidMatch ? ssidMatch[1].replace(/\\([\\;,:"])/g, '$1') : 'Unknown';
    const sec = secMatch ? secMatch[1] : 'WPA';
    const pass = passMatch ? passMatch[1].replace(/\\([\\;,:"])/g, '$1') : '';
    const isHidden = hiddenMatch ? hiddenMatch[1] === 'true' : false;

    return {
      actionTitle: 'Join Wi-Fi Network',
      actionSubtitle: 'Auto-configure network connection',
      badge: 'Wi-Fi',
      primaryValue: ssid,
      fields: [
        { label: 'Network (SSID)', value: ssid },
        { label: 'Security', value: sec === 'nopass' ? 'Open (No password)' : sec },
        { label: 'Password', value: pass ? '••••••••' : 'None' },
        { label: 'Hidden Network', value: isHidden ? 'Yes' : 'No' },
      ],
    };
  }

  if (type === 'vcard' || payload.startsWith('BEGIN:VCARD')) {
    const fnMatch = payload.match(/FN:([^\n\r]+)/);
    const telMatch = payload.match(/TEL[^:]*:([^\n\r]+)/);
    const emailMatch = payload.match(/EMAIL[^:]*:([^\n\r]+)/);
    const orgMatch = payload.match(/ORG:([^\n\r]+)/);
    const titleMatch = payload.match(/TITLE:([^\n\r]+)/);

    return {
      actionTitle: 'Add to Contacts',
      actionSubtitle: 'Save contact card (vCard 3.0)',
      badge: 'Contact',
      primaryValue: fnMatch ? fnMatch[1] : 'New Contact',
      fields: [
        { label: 'Name', value: fnMatch ? fnMatch[1] : '' },
        { label: 'Phone', value: telMatch ? telMatch[1] : '—' },
        { label: 'Email', value: emailMatch ? emailMatch[1] : '—' },
        { label: 'Company', value: orgMatch ? orgMatch[1] : '—' },
        { label: 'Title', value: titleMatch ? titleMatch[1] : '—' },
      ].filter(f => f.value && f.value !== '—'),
    };
  }

  if (type === 'email' || payload.startsWith('mailto:')) {
    const email = payload.replace('mailto:', '').split('?')[0];
    const urlObj = new URL(payload);
    const subject = urlObj.searchParams.get('subject') || 'No subject';
    return {
      actionTitle: 'Send New Email',
      actionSubtitle: 'Open default email client',
      badge: 'Email',
      primaryValue: email,
      fields: [
        { label: 'Recipient', value: email },
        { label: 'Subject', value: subject },
      ],
    };
  }

  if (type === 'phone' || payload.startsWith('tel:')) {
    const num = payload.replace('tel:', '');
    return {
      actionTitle: 'Call Phone Number',
      actionSubtitle: 'Dial phone number',
      badge: 'Phone',
      primaryValue: num,
      fields: [{ label: 'Number', value: num }],
    };
  }

  if (type === 'sms' || payload.startsWith('smsto:')) {
    const parts = payload.replace('smsto:', '').split(':');
    const phone = parts[0] || '';
    const body = parts.slice(1).join(':') || '';
    return {
      actionTitle: 'Send Text Message (SMS)',
      actionSubtitle: 'Open messaging app',
      badge: 'SMS',
      primaryValue: phone,
      fields: [
        { label: 'Recipient', value: phone },
        { label: 'Prefilled Text', value: body || '(Empty message)' },
      ],
    };
  }

  return {
    actionTitle: 'Plain Text Decoded',
    actionSubtitle: 'Copy or view text',
    badge: 'Text',
    primaryValue: payload.length > 60 ? `${payload.substring(0, 60)}…` : payload,
    fields: [
      { label: 'Characters', value: `${payload.length}` },
      { label: 'Bytes (UTF-8)', value: `${new TextEncoder().encode(payload).length}` },
    ],
  };
}
