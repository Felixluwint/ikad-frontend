function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export const PRODUCT_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#dbe4ef" />
      </linearGradient>
    </defs>
    <rect width="480" height="480" rx="36" fill="url(#bg)" />
    <g fill="none" stroke="#cbd5e1" stroke-width="8" opacity="0.9">
      <path d="M60 160h360" />
      <path d="M60 240h360" />
      <path d="M60 320h360" />
      <path d="M160 60v360" />
      <path d="M240 60v360" />
      <path d="M320 60v360" />
    </g>
    <rect x="96" y="96" width="288" height="288" rx="28" fill="none" stroke="#94a3b8" stroke-width="12" />
  </svg>
`)}`;

function resolveLoopbackAssetUrl(source: string) {
  try {
    const parsed = new URL(source);
    const isLoopbackAsset =
      (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost') &&
      parsed.port === '8000';
    const isLoopbackFrontend =
      typeof window !== 'undefined' &&
      (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost');

    if (isLoopbackAsset && isLoopbackFrontend) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return source;
  }

  return source;
}

export function resolveProductImage(image?: string | null) {
  if (image && image.trim().length > 0) {
    return resolveLoopbackAssetUrl(image.trim());
  }

  return PRODUCT_PLACEHOLDER;
}

export function parseTileSize(size?: string) {
  const [width = "60", height = width] = (size ?? "60x60").toLowerCase().split("x");
  const widthCm = Number(width) || 60;
  const heightCm = Number(height) || widthCm;

  return {
    widthCm,
    heightCm,
  };
}

export function getTilePixels(size: string | undefined, scale = 1) {
  const { widthCm, heightCm } = parseTileSize(size);
  const widthPx = clamp(widthCm * 2.25 * scale, 38, 240);
  const heightPx = clamp(heightCm * 2.25 * scale, 38, 320);

  return {
    widthPx,
    heightPx,
  };
}
