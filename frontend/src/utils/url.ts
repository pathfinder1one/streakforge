export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path; // Already absolute URL

  // If VITE_API_URL is set (e.g., https://my-backend.railway.app/api)
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  if (apiUrl) {
    // Strip the trailing /api from VITE_API_URL to get the root domain
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  // If VITE_API_URL is not set, we are on the same domain as the backend
  return path;
}
