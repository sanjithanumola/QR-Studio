export interface PresetLogo {
  id: string;
  name: string;
  svgDataUri: string;
}

function makeSvgUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export const PRESET_LOGOS: PresetLogo[] = [
  {
    id: 'globe',
    name: 'Website',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    `),
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
        <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
    `),
  },
  {
    id: 'user',
    name: 'Contact',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `),
  },
  {
    id: 'mail',
    name: 'Email',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
      </svg>
    `),
  },
  {
    id: 'phone',
    name: 'Phone',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    `),
  },
  {
    id: 'star',
    name: 'Star',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `),
  },
  {
    id: 'heart',
    name: 'Heart',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="#e11d48" stroke="#be123c" stroke-width="1.5">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
      </svg>
    `),
  },
  {
    id: 'cart',
    name: 'Store',
    svgDataUri: makeSvgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8" cy="21" r="1"></circle>
        <circle cx="19" cy="21" r="1"></circle>
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
      </svg>
    `),
  },
];
