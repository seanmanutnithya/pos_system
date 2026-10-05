// What the backend accepts for brand and product images
// (see backend/src/helper/image.helper.js)
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const MAX_IMAGE_MB = 5;
export const IMAGE_HINT = `JPEG, PNG, GIF or WebP, up to ${MAX_IMAGE_MB} MB.`;

// The API stores image paths like /api/v1/assets/brand/<file>.png. In
// development they load through the dev proxy as they are. When the API is on
// another origin (VITE_API_BASE_URL is a full URL), they load from there.
export const assetUrl = (path) => {
  if (!path) return null;
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  return apiBase && /^https?:\/\//.test(apiBase) ? new URL(path, apiBase).href : path;
};
