import QRCode from 'qrcode';
import { CornerStyle, ModuleStyle, QrCustomization } from '../types/qr';

export interface QrMatrixData {
  size: number;
  modules: boolean[][];
}

export function generateMatrix(payload: string, ecLevel: 'L' | 'M' | 'Q' | 'H'): QrMatrixData {
  const qr = QRCode.create(payload, {
    errorCorrectionLevel: ecLevel,
  });

  const size = qr.modules.size;
  const modules: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    modules[r] = [];
    for (let c = 0; c < size; c++) {
      modules[r][c] = Boolean(qr.modules.get(r, c));
    }
  }

  return { size, modules };
}

/**
 * Checks if a coordinate (r, c) belongs to one of the three 7x7 finder patterns
 */
export function isFinderPattern(r: number, c: number, size: number): boolean {
  // Top-left finder
  if (r >= 0 && r < 7 && c >= 0 && c < 7) return true;
  // Top-right finder
  if (r >= 0 && r < 7 && c >= size - 7 && c < size) return true;
  // Bottom-left finder
  if (r >= size - 7 && r < size && c >= 0 && c < 7) return true;
  return false;
}

/**
 * Checks if coordinate is inside the center logo cutout
 */
export function isInLogoArea(
  r: number,
  c: number,
  size: number,
  logoSizeRatio: number
): boolean {
  if (!logoSizeRatio || logoSizeRatio <= 0) return false;
  const center = (size - 1) / 2;
  const halfSpan = (size * logoSizeRatio) / 2 + 0.6; // slight safety clearance
  return Math.abs(r - center) <= halfSpan && Math.abs(c - center) <= halfSpan;
}

/**
 * Color luminance and WCAG contrast ratio calculations
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(char => char + char).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export interface ContrastAnalysis {
  ratio: number;
  rating: 'optimal' | 'caution' | 'critical';
  isInverted: boolean;
  message: string;
}

export function analyzeContrast(fgHex: string, bgHex: string): ContrastAnalysis {
  try {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const lumFg = getLuminance(fg.r, fg.g, fg.b);
    const lumBg = getLuminance(bg.r, bg.g, bg.b);

    const lighter = Math.max(lumFg, lumBg);
    const darker = Math.min(lumFg, lumBg);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    const isInverted = lumFg > lumBg;

    if (ratio < 2.5) {
      return {
        ratio: Math.round(ratio * 10) / 10,
        rating: 'critical',
        isInverted,
        message: 'Insufficient color contrast. Most phone cameras will not scan this code.',
      };
    } else if (ratio < 4.0 || isInverted) {
      return {
        ratio: Math.round(ratio * 10) / 10,
        rating: 'caution',
        isInverted,
        message: isInverted
          ? 'Inverted color scheme (light dots on dark background). Some legacy QR readers may take longer.'
          : 'Moderate contrast. Scanning might be slow in dim ambient light.',
      };
    }

    return {
      ratio: Math.round(ratio * 10) / 10,
      rating: 'optimal',
      isInverted,
      message: 'High contrast. Excellent scannability across all devices.',
    };
  } catch {
    return {
      ratio: 21,
      rating: 'optimal',
      isInverted: false,
      message: 'Standard contrast.',
    };
  }
}

/**
 * Render QR matrix to an HTML Canvas
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  matrix: QrMatrixData,
  options: QrCustomization,
  renderSize: number
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = renderSize;
  canvas.height = renderSize;

  const { size, modules } = matrix;
  const marginModules = options.margin;
  const totalModules = size + marginModules * 2;
  const cellSize = renderSize / totalModules;
  const marginOffset = marginModules * cellSize;

  // Clear canvas
  ctx.clearRect(0, 0, renderSize, renderSize);

  // Background
  if (!options.isTransparentBg) {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, renderSize, renderSize);
  }

  const fgColor = options.fgColor;
  const cornerColor = options.customCornerColor ? options.cornerColor : fgColor;

  // 1. Draw Data Modules (excluding finder patterns and logo area)
  ctx.fillStyle = fgColor;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c, size)) continue;
      if (options.logo && isInLogoArea(r, c, size, options.logoSize)) continue;

      if (modules[r][c]) {
        const x = marginOffset + c * cellSize;
        const y = marginOffset + r * cellSize;

        drawModule(ctx, x, y, cellSize, options.moduleStyle);
      }
    }
  }

  // 2. Draw the 3 Finder Patterns
  drawFinderPatternCanvas(ctx, marginOffset, marginOffset, cellSize, options.cornerStyle, cornerColor, options.bgColor);
  drawFinderPatternCanvas(
    ctx,
    marginOffset + (size - 7) * cellSize,
    marginOffset,
    cellSize,
    options.cornerStyle,
    cornerColor,
    options.bgColor
  );
  drawFinderPatternCanvas(
    ctx,
    marginOffset,
    marginOffset + (size - 7) * cellSize,
    cellSize,
    options.cornerStyle,
    cornerColor,
    options.bgColor
  );

  // 3. Draw Center Logo if present
  if (options.logo) {
    await drawLogoCanvas(ctx, options, renderSize);
  }
}

function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: ModuleStyle
) {
  switch (style) {
    case 'dots': {
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rounded': {
      const radius = size * 0.35;
      drawRoundedRect(ctx, x + 0.4, y + 0.4, size - 0.8, size - 0.8, radius);
      ctx.fill();
      break;
    }
    case 'squircle': {
      const radius = size * 0.46;
      drawRoundedRect(ctx, x, y, size, size, radius);
      ctx.fill();
      break;
    }
    case 'square':
    default: {
      ctx.fillRect(x, y, size + 0.1, size + 0.1);
      break;
    }
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFinderPatternCanvas(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  style: CornerStyle,
  color: string,
  bgColor: string
) {
  const outerWidth = cellSize * 7;
  const innerWhiteWidth = cellSize * 5;
  const eyeWidth = cellSize * 3;

  ctx.fillStyle = color;

  switch (style) {
    case 'circle': {
      // Outer filled circle
      ctx.beginPath();
      ctx.arc(x + outerWidth / 2, y + outerWidth / 2, outerWidth / 2, 0, Math.PI * 2);
      ctx.fill();

      // Middle cutout circle (bg color)
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.arc(x + outerWidth / 2, y + outerWidth / 2, innerWhiteWidth / 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner eye circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + outerWidth / 2, y + outerWidth / 2, eyeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rounded': {
      const outerR = cellSize * 1.8;
      const innerWhiteR = cellSize * 1.2;
      const eyeR = cellSize * 0.9;

      // Outer ring
      drawRoundedRect(ctx, x, y, outerWidth, outerWidth, outerR);
      ctx.fill();

      // White inner cutout
      ctx.fillStyle = bgColor;
      drawRoundedRect(ctx, x + cellSize, y + cellSize, innerWhiteWidth, innerWhiteWidth, innerWhiteR);
      ctx.fill();

      // Center eye
      ctx.fillStyle = color;
      drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, eyeWidth, eyeWidth, eyeR);
      ctx.fill();
      break;
    }

    case 'leaf': {
      // Modern diagonal leaf style
      ctx.beginPath();
      ctx.moveTo(x + cellSize * 2, y);
      ctx.lineTo(x + outerWidth, y);
      ctx.lineTo(x + outerWidth, y + outerWidth - cellSize * 2);
      ctx.quadraticCurveTo(x + outerWidth, y + outerWidth, x + outerWidth - cellSize * 2, y + outerWidth);
      ctx.lineTo(x, y + outerWidth);
      ctx.lineTo(x, y + cellSize * 2);
      ctx.quadraticCurveTo(x, y, x + cellSize * 2, y);
      ctx.closePath();
      ctx.fill();

      // Cutout
      ctx.fillStyle = bgColor;
      drawRoundedRect(ctx, x + cellSize, y + cellSize, innerWhiteWidth, innerWhiteWidth, cellSize);
      ctx.fill();

      // Eye
      ctx.fillStyle = color;
      drawRoundedRect(ctx, x + cellSize * 2, y + cellSize * 2, eyeWidth, eyeWidth, cellSize * 0.8);
      ctx.fill();
      break;
    }

    case 'square':
    default: {
      // Standard 7x7 outer frame
      ctx.fillRect(x, y, outerWidth, outerWidth);

      // 5x5 cutout
      ctx.fillStyle = bgColor;
      ctx.fillRect(x + cellSize, y + cellSize, innerWhiteWidth, innerWhiteWidth);

      // 3x3 eye
      ctx.fillStyle = color;
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, eyeWidth, eyeWidth);
      break;
    }
  }
}

async function drawLogoCanvas(
  ctx: CanvasRenderingContext2D,
  options: QrCustomization,
  renderSize: number
): Promise<void> {
  const logoSrc = options.logo;
  if (!logoSrc) return;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const logoBoxSize = renderSize * options.logoSize;
      const logoX = (renderSize - logoBoxSize) / 2;
      const logoY = (renderSize - logoBoxSize) / 2;
      const padding = options.logoPadding * (renderSize / 400);

      // Logo background cutout
      if (options.logoBgShape === 'circle') {
        ctx.fillStyle = options.bgColor;
        ctx.beginPath();
        ctx.arc(renderSize / 2, renderSize / 2, logoBoxSize / 2 + padding, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = options.fgColor + '20';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (options.logoBgShape === 'rounded') {
        ctx.fillStyle = options.bgColor;
        const badgeRadius = logoBoxSize * 0.22;
        drawRoundedRect(
          ctx,
          logoX - padding,
          logoY - padding,
          logoBoxSize + padding * 2,
          logoBoxSize + padding * 2,
          badgeRadius
        );
        ctx.fill();
        ctx.strokeStyle = options.fgColor + '20';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw image centered inside the box
      const aspect = img.width / img.height;
      let drawW = logoBoxSize;
      let drawH = logoBoxSize;
      if (aspect > 1) {
        drawH = logoBoxSize / aspect;
      } else {
        drawW = logoBoxSize * aspect;
      }

      const drawX = (renderSize - drawW) / 2;
      const drawY = (renderSize - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = logoSrc;
  });
}

/**
 * Generate a standalone scalable vector SVG string
 */
export function generateQrSvg(
  matrix: QrMatrixData,
  options: QrCustomization
): string {
  const { size, modules } = matrix;
  const margin = options.margin;
  const total = size + margin * 2;
  const fgColor = options.fgColor;
  const cornerColor = options.customCornerColor ? options.cornerColor : fgColor;
  const bgColor = options.bgColor;

  const svgParts: string[] = [];

  // Opening SVG tag
  svgParts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${total} ${total}" width="100%" height="100%" shape-rendering="geometricPrecision">`
  );

  // Background rect
  if (!options.isTransparentBg) {
    svgParts.push(`<rect width="${total}" height="${total}" fill="${bgColor}" />`);
  }

  // Data modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinderPattern(r, c, size)) continue;
      if (options.logo && isInLogoArea(r, c, size, options.logoSize)) continue;

      if (modules[r][c]) {
        const x = margin + c;
        const y = margin + r;

        if (options.moduleStyle === 'dots') {
          svgParts.push(
            `<circle cx="${(x + 0.5).toFixed(2)}" cy="${(y + 0.5).toFixed(2)}" r="0.42" fill="${fgColor}" />`
          );
        } else if (options.moduleStyle === 'rounded') {
          svgParts.push(
            `<rect x="${(x + 0.05).toFixed(2)}" y="${(y + 0.05).toFixed(2)}" width="0.9" height="0.9" rx="0.32" fill="${fgColor}" />`
          );
        } else if (options.moduleStyle === 'squircle') {
          svgParts.push(
            `<rect x="${x}" y="${y}" width="1" height="1" rx="0.45" fill="${fgColor}" />`
          );
        } else {
          svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${fgColor}" />`);
        }
      }
    }
  }

  // Corner helper generator
  const renderCornerSvg = (x: number, y: number) => {
    if (options.cornerStyle === 'circle') {
      return `
        <g fill="${cornerColor}">
          <circle cx="${x + 3.5}" cy="${y + 3.5}" r="3.5" fill="${cornerColor}" />
          <circle cx="${x + 3.5}" cy="${y + 3.5}" r="2.5" fill="${bgColor}" />
          <circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${cornerColor}" />
        </g>
      `;
    } else if (options.cornerStyle === 'rounded') {
      return `
        <g fill="${cornerColor}">
          <rect x="${x}" y="${y}" width="7" height="7" rx="1.8" fill="${cornerColor}" />
          <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.2" fill="${bgColor}" />
          <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.8" fill="${cornerColor}" />
        </g>
      `;
    } else if (options.cornerStyle === 'leaf') {
      return `
        <g fill="${cornerColor}">
          <path d="M${x + 2},${y} L${x + 7},${y} L${x + 7},${y + 5} Q${x + 7},${y + 7} ${x + 5},${y + 7} L${x},${y + 7} L${x},${y + 2} Q${x},${y} ${x + 2},${y} Z" fill="${cornerColor}" />
          <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1" fill="${bgColor}" />
          <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.8" fill="${cornerColor}" />
        </g>
      `;
    } else {
      return `
        <g fill="${cornerColor}">
          <rect x="${x}" y="${y}" width="7" height="7" fill="${cornerColor}" />
          <rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="${bgColor}" />
          <rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="${cornerColor}" />
        </g>
      `;
    }
  };

  // 3 Finder patterns
  svgParts.push(renderCornerSvg(margin, margin));
  svgParts.push(renderCornerSvg(margin + size - 7, margin));
  svgParts.push(renderCornerSvg(margin, margin + size - 7));

  // Logo in SVG
  if (options.logo) {
    const logoSpan = total * options.logoSize;
    const logoX = (total - logoSpan) / 2;
    const logoY = (total - logoSpan) / 2;
    const pad = 0.5;

    if (options.logoBgShape === 'circle') {
      svgParts.push(
        `<circle cx="${total / 2}" cy="${total / 2}" r="${logoSpan / 2 + pad}" fill="${bgColor}" stroke="${fgColor}33" stroke-width="0.1" />`
      );
    } else if (options.logoBgShape === 'rounded') {
      svgParts.push(
        `<rect x="${logoX - pad}" y="${logoY - pad}" width="${logoSpan + pad * 2}" height="${logoSpan + pad * 2}" rx="${logoSpan * 0.2}" fill="${bgColor}" stroke="${fgColor}33" stroke-width="0.1" />`
      );
    }

    svgParts.push(
      `<image href="${options.logo}" x="${logoX}" y="${logoY}" width="${logoSpan}" height="${logoSpan}" preserveAspectRatio="xMidYMid meet" />`
    );
  }

  svgParts.push('</svg>');
  return svgParts.join('\n');
}
