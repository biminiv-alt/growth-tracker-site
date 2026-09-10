const SWAP = {
  '#f4f7f2': '#f0ede4','#e6ede1': '#e5e0d2','#b8c9ac': '#a5b0a0',
  '#7d9b73': '#4a5d55','#4f6a4a': '#2d3d34','#2b3a29': '#1a2e26',
  '#e8b39a': '#d9c5a5','#cf7955': '#b8935a','#a15837': '#8a6b3d',
  '#fbf7f1': '#f7f3ec','#2a2723': '#1a2e26','#5a5651': '#4a5d55',
  '#e5ded2': '#d9d0c1'
};
const BEACON = '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token":"8169c71f4b174d1a88ea5a5732671a6b"}\'></script>';
export const onRequest = async ({ next }) => {
  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;
  let html = await response.text();
  for (const [o, n] of Object.entries(SWAP)) {
    html = html.split(o).join(n);
    const O = o.toUpperCase();
    if (O !== o) html = html.split(O).join(n);
  }
  if (/<\/body>/i.test(html)) {
    html = html.replace(/<\/body>/i, BEACON + '</body>');
  } else {
    html += BEACON;
  }
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};
