import { API_BASE_URL } from '@/shared/api';

const apiRoot = String(API_BASE_URL || '').replace(/\/api\/?$/, '');

export const displayAssetUrl = (value?: string | null) => {
  const src = String(value || '').trim();
  if (!src) return '';
  if (/^(https?:|data:|blob:)/i.test(src)) return src;

  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
  return encodeURI(`${apiRoot}${normalizedSrc}`);
};
