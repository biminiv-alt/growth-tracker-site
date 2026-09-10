export const onRequest = async ({ request, next }) => {
  const response = await next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;
  const rewriter = new HTMLRewriter().on('body', {
    element(el) {
      el.append(
        '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token":"8169c71f4b174d1a88ea5a5732671a6b"}\'></script>',
        { html: true }
      );
    }
  });
  return rewriter.transform(response);
};
